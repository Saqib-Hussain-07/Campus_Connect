# ==========================================
# CampusConnect Backend Server Dockerfile
# ==========================================
FROM node:20-alpine AS base

# Install security updates and curl for healthcheck
RUN apk --no-cache add curl

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy server application source code
COPY server/ ./server/

# Create uploads directory structure
RUN mkdir -p assets/uploads/avatars

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend REST and Socket.IO port
EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/general/health || exit 1

# Start the server
CMD ["node", "server/index.js"]
