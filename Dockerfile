# kerniva.app static marketing site plus the form intake API (the live
# simulation is behind a waitlist for now; the /try packaging lives in git
# history). Both run in one container so Coolify keeps its Dockerfile build
# pack on port 80, and so the browser only ever talks to one origin.
FROM node:24-bookworm-slim AS site
WORKDIR /site
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-bookworm-slim AS api
WORKDIR /build
RUN corepack enable
COPY api/package.json api/pnpm-lock.yaml api/
RUN cd api && pnpm install --frozen-lockfile
COPY shared/ shared/
COPY api/ api/
RUN cd api && pnpm build && pnpm prune --prod

FROM nginx:1.27-alpine
# nodejs only: nodemailer is pure JavaScript, so the modules built on Debian
# above carry over to musl untouched.
RUN apk add --no-cache nodejs
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=site /site/dist /srv/site
COPY --from=api /build/api/dist /srv/api/dist
COPY --from=api /build/api/node_modules /srv/api/node_modules
COPY docker-entrypoint.sh /usr/local/bin/kerniva-entrypoint
RUN chmod +x /usr/local/bin/kerniva-entrypoint
ENV NODE_ENV=production FORMS_API_PORT=8080
EXPOSE 80
CMD ["/usr/local/bin/kerniva-entrypoint"]
