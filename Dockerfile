# ---- build the static site
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
# Site info is baked in at build time (see .env.example)
ARG VITE_SITE_NAME
ARG VITE_SITE_TAGLINE
ARG VITE_SITE_ADDRESS
ARG VITE_SITE_PHONE
ARG VITE_SITE_EMAIL
ARG VITE_API_BASE
RUN npm run build

# ---- serve with nginx, proxying /api to the backend
FROM nginx:1.27-alpine
# nginx's entrypoint runs envsubst on /etc/nginx/templates/*.template at container start
ENV API_UPSTREAM=http://api:8080 \
    NGINX_RESOLVER=127.0.0.11
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
