# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Serve with nginx (SPA + optional /api proxy to backend)
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
# SPA fallback + proxy /api to backend when BACKEND_URL is set via env in compose
RUN echo 'server{listen 80;root /usr/share/nginx/html;index index.html;location /api/{proxy_pass http://backend:3001;proxy_http_version 1.1;proxy_set_header Host $host;proxy_set_header X-Real-IP $remote_addr;proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;proxy_set_header X-Forwarded-Proto $scheme;}location /{try_files $uri $uri/ /index.html;}}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
