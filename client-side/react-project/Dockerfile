# Stage 1: Build the React application with Vite
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the application source code
COPY . .

# Set up build arguments for Vite environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the production-ready static assets
RUN npm run build

# Stage 2: Serve the static files using Nginx
FROM nginx:alpine

# Copy the custom nginx configuration for React Router routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from build stage to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
