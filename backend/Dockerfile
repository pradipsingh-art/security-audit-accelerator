# Base image
FROM node:18-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Create app directory
WORKDIR /app

# Default environment variables so Prisma doesn't crash during the build step
ENV DATABASE_URL="file:./dev.db"
ENV JWT_SECRET="super-secure-production-key"

# Copy dependency definitions
COPY package*.json ./

# Install dependecies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client explicitly for the Debian environment & create a local DB file in the image
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss

# Copy the rest of the application
COPY . .

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080
ENV PORT=8080

# Command to run the application
CMD [ "npm", "start" ]
