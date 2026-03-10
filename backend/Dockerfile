# Base image
FROM node:18-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Create app directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependecies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080
ENV PORT=8080

# Default environment variables to prevent crash if not set in Cloud Run
ENV DATABASE_URL="file:./dev.db"
ENV JWT_SECRET="super-secure-production-key"

# Command to run the application
CMD [ "npm", "start" ]
