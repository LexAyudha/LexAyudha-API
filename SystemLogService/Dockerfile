FROM node:20-alpine

WORKDIR /app

COPY .env /app/.env

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Command to run your application
CMD ["node", "server.js"]
