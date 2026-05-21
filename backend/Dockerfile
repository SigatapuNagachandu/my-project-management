# Use the official Node.js 20 LTS Alpine image for a lightweight container
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install production dependencies only to keep the image slim
RUN npm ci --only=production

# Copy the rest of the application files
COPY . .

# Expose the port the backend server runs on
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Command to run the backend server
CMD ["node", "server.js"]
