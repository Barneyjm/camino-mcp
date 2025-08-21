# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy source code first
COPY src ./src

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Build the TypeScript code manually (no longer in prepare script)
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (skip prepare script since we already built)
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001

# Change to non-root user
USER mcp

# Set environment variables
ENV NODE_ENV=production

# CAMINO_API_KEY must be provided at runtime
# Example: docker run -e CAMINO_API_KEY=your_key_here camino-mcp

# Start the MCP server using Docker entry point
CMD ["node", "build/docker-entry.js"]