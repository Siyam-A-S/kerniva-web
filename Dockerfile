# kerniva.app — marketing site + the "Try Kerniva" simulation, one nginx image.
# The simulation build is pulled from the monorepo's published image so a site
# deploy never needs the product repository.
ARG TRY_IMAGE=ghcr.io/siyam-a-s/kerniva-try-web:latest
FROM ${TRY_IMAGE} AS try

FROM node:24-bookworm-slim AS build
WORKDIR /site
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY kerniva-proxy.inc /etc/nginx/kerniva-proxy.inc
COPY --from=build /site/dist /srv/site
COPY --from=try /srv/try /srv/try
EXPOSE 80
