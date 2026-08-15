# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency descriptors
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy client source code and public assets
COPY . .

# Build optimized production bundle
ENV NODE_ENV=production
RUN npm run build

# ==========================================
# Stage 2: Production Nginx Static Server
# ==========================================
FROM nginx:1.25-alpine AS production

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build artifacts from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Healthcheck for Nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
