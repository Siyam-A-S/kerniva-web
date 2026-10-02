# kerniva.app hosting

The marketing site on Azure Container Apps, behind Cloudflare.

```
Cloudflare (proxied DNS, WAF, cache, Full strict TLS)
  └─ Container Apps ingress (TLS with a Cloudflare Origin CA certificate)
       └─ ca-kerniva-site: one container, nginx on :80 + the forms API on loopback
```

Everything is in resource group `rg-kerniva-site` (region `eastus2`), in the same subscription and tenant as the product demo (`rg-kerniva-demo`, `centralus`) but sharing nothing with it: its own Container Apps environment, registry, identity and log workspace. This root owns only those resources. The product's infrastructure lives in the `kerniva-prod` repository and is never touched from here.

| Resource                   | Name               |
| -------------------------- | ------------------ |
| Container App              | `ca-kerniva-site`  |
| Container Apps environment | `cae-kerniva-site` |
| Registry (Basic)           | `acrkernivasite`   |
| Managed identity (AcrPull) | `id-kerniva-site`  |
| Log Analytics workspace    | `log-kerniva-site` |

The app runs **exactly one replica, always on**. The forms API keeps its rate limits, daily send cap and spent form tokens in memory, so more replicas or scale to zero break the forms. Do not raise `max_replicas`.

## One-time bootstrap

Three things exist outside this root because they cannot be created by it. Run every `az` command with `--subscription` set to the Kerniva subscription: the same login can see another subscription in another tenant.

**1. State storage.** A backend cannot create the storage that holds it.

```bash
SUB=<the Kerniva subscription id>
az group create --subscription $SUB -n rg-kerniva-tfstate -l centralus
az storage account create --subscription $SUB -n stkernivatfstate -g rg-kerniva-tfstate -l centralus \
  --sku Standard_LRS --allow-blob-public-access false --min-tls-version TLS1_2
az storage account blob-service-properties update --subscription $SUB \
  --account-name stkernivatfstate -g rg-kerniva-tfstate --enable-versioning true
az storage container create --subscription $SUB -n tfstate --account-name stkernivatfstate --auth-mode login
```

`use_azuread_auth` means the person running `tofu` needs **Storage Blob Data Contributor** on that account; being Owner of the subscription is not enough.

**2. The pipeline's identity.** An Entra app registration with one federated credential, so GitHub Actions can sign in with no stored secret.

```bash
az ad app create --display-name gha-kerniva-site-deploy
az ad sp create --id <appId from above>
az ad app federated-credential create --id <appId> --parameters '{
  "name": "github-environment-site",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:Siyam-A-S@98270965/kerniva-web@1343382965:environment:site",
  "audiences": ["api://AzureADTokenExchange"]
}'
```

The subject is the ID-qualified form GitHub now presents (`gh api /repos/Siyam-A-S/kerniva-web` gives `owner.id` and `id`); the plain `repo:<owner>/<repo>:...` form fails with `AADSTS700213`. If it ever stops matching, the failed `azure/login` step prints the subject it sent under "Federated token details". The object ID of the service principal (`az ad sp show --id <appId> --query id -o tsv`) is `deploy_principal_id` below.

**3. The GitHub environment.** In the repository settings, create an environment named `site`, restrict its deployment branches to `main`, and add three environment secrets: `AZURE_CLIENT_ID` (the appId), `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`.

## Applying

Secrets go through the environment, never the command line, where `ps` would show them.

```bash
cd infra/opentofu
cp backend.hcl.example backend.hcl        # fill in the subscription id
tofu init -backend-config=backend.hcl

export TF_VAR_subscription_id=<the Kerniva subscription id>
export TF_VAR_tenant_id=<its tenant id>
export TF_VAR_deploy_principal_id=<object id of the pipeline's service principal>
read -rs TF_VAR_form_token_secret && export TF_VAR_form_token_secret   # openssl rand -hex 32
read -rs TF_VAR_smtp_pass && export TF_VAR_smtp_pass                   # Workspace app password
```

The first apply runs with no image, because a Container App cannot be created pointing at a tag the registry does not hold yet:

```bash
tofu apply                      # resource group, environment, registry, identities, roles
```

Then run the **Deploy site** workflow once. It pushes `acrkernivasite.azurecr.io/kerniva-site:sha-<commit>` and reports that the app does not exist yet. Record that image in `site.auto.tfvars`, which `tofu` loads on its own and git ignores, and apply again to create the app:

```bash
echo 'image = "acrkernivasite.azurecr.io/kerniva-site:sha-<commit>"' >> site.auto.tfvars
tofu apply
```

From then on every push to `main` that passes CI rolls a new revision. The `image` value only decides the first revision: later changes to it are ignored, so an apply never rolls the site back. It still has to stay set, because an empty `image` means "no app" and would plan the app for removal. Keep the other non-secret settings in the same file.

## Custom domain

Cloudflare stays in front, so the certificate at the origin is a Cloudflare Origin CA certificate, not an Azure managed one (which would need to reach the app directly to validate and renew). It is uploaded with the CLI so the private key never enters state.

1. In Cloudflare, create an Origin CA certificate for `kerniva.app` and `*.kerniva.app`. Save the certificate and key as PEM, then bundle them: `openssl pkcs12 -export -out origin.pfx -inkey origin.key -in origin.pem`.
2. `az containerapp env certificate upload --subscription $SUB -g rg-kerniva-site -n cae-kerniva-site --certificate-file origin.pfx --certificate-name cloudflare-origin --password <pfx password>`
3. In Cloudflare DNS, add a TXT record `asuid` (that is, `asuid.kerniva.app`) with the value of `tofu output domain_verification_id`.
4. Add `origin_certificate_name = "cloudflare-origin"` to `site.auto.tfvars` and `tofu apply`. This binds `kerniva.app` to the app. Binding does not move any traffic.
5. Test the origin before pointing DNS at it. HSTS is preloaded for the domain, so a browser will not accept this certificate directly; use curl:
   `curl -sk --resolve kerniva.app:443:$(tofu output -raw environment_static_ip) https://kerniva.app/ -I`
6. In Cloudflare DNS, point the apex at `tofu output app_fqdn` with a proxied CNAME (Cloudflare flattens it), with SSL mode Full (strict).
7. Once traffic is flowing, lock the origin to Cloudflare by setting `ingress_allowed_cidrs` to the ranges at https://www.cloudflare.com/ips-v4 and applying. Review that list when Cloudflare announces changes: a stale list drops real visitors.

Delete `origin.key` and `origin.pfx` from disk afterwards. `.gitignore` already refuses them.

## Rolling back

```bash
az containerapp revision list --subscription $SUB -g rg-kerniva-site -n ca-kerniva-site -o table
az containerapp update --subscription $SUB -g rg-kerniva-site -n ca-kerniva-site \
  --image acrkernivasite.azurecr.io/kerniva-site:sha-<previous commit>
```
