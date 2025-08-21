# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy source code first
COPY src ./src

# Install all dependencies (including dev dependencies for building)
# The prepare script will run npm run build automatically
RUN npm ci

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
ENV MCP_DEBUG=false

# Start the MCP server
CMD ["node", "build/index.js"]