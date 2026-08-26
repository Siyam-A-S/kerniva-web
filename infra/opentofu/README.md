# kerniva.app hosting

Static site on a private S3 bucket behind CloudFront, with an ACM certificate (us-east-1) and Route 53 alias records. A CloudFront Function rewrites non-asset paths to `index.html` for React Router and redirects `www.` to the apex.

Prerequisites: a Route 53 hosted zone for `kerniva.app` in the target account, and the shared state bucket / lock table from the main Kerniva infrastructure.

```bash
cd infra/opentofu
cp backend.example.hcl backend.hcl   # fill in state bucket
tofu init -backend-config=backend.hcl
tofu plan -var environment=nonprod -out=nonprod.tfplan
tofu apply nonprod.tfplan
```

`environment=production` serves `kerniva.app` and `www.kerniva.app`; any other value serves `<environment>.kerniva.app`. Deploys upload `dist/` to the bucket and invalidate the distribution; see `.github/workflows/deploy.yml`.
