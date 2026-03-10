# Base image
FROM node:18-alpine

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

# Command to run the application
CMD [ "npm", "start" ]
