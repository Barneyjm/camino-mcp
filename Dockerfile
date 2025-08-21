FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcp -u 1001

# Change to non-root user
USER mcp

# Expose the MCP server (though it runs on stdio)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV MCP_DEBUG=false

# Start the MCP server
CMD ["node", "build/index.js"]