# Base image - Node 20 required by AWS SDK
FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Set DATABASE_URL to /tmp (writable on Cloud Run)
ENV DATABASE_URL="file:/tmp/dev.db"
ENV JWT_SECRET="super-secure-production-key"

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Create the SQLite database in /tmp (writable at runtime)
RUN npx prisma db push --accept-data-loss

# Copy the rest of the application
COPY . .

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080
ENV PORT=8080

# Command to run the application
CMD [ "node", "server.js" ]
