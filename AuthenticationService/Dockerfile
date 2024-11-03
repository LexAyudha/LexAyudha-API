FROM node:20-alpine

WORKDIR /app

COPY .env /app/.env

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# ENV PORT=8002 \
#     JWT_SECRET='DSJWTSECRET' \
#     DATABASE_URI='mongodb+srv://falcon:GyFpeoKoEx1bL2AU@learnifycluster.d7uaoh7.mongodb.net/?retryWrites=true&w=majority&appName=LearnifyCluster' \
#     DB_CONNECTION_TIMEOUT=30000 \
#     DB_NAME='LearnifyDB' \
#     DB_MIN_POOL_SIZE=100 \
#     DB_MAX_POOL_SIZE=200


# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Command to run your application
CMD ["node", "server.js"]
