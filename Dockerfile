# Multi-stage production build for RezSocials Cloud Run deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors first for caching
COPY package*.json ./

# Install all dependencies including build devDependencies
RUN npm ci || npm install

# Copy source code and assets
COPY . .

# Build the frontend assets to dist/
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy server entry point, built assets, and public directory
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.cjs ./server.cjs
COPY --from=builder /app/metadata.json ./metadata.json

# Cloud Run dynamic port exposure
EXPOSE 3000

# Launch custom production server with Cloud Run PORT handling
CMD ["node", "server.cjs"]
