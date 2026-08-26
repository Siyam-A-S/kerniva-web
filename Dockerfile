# kerniva.app static marketing site (the live simulation is behind a
# waitlist for now; the /try packaging lives in git history).
FROM node:24-bookworm-slim AS build
WORKDIR /site
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site/dist /srv/site
EXPOSE 80
