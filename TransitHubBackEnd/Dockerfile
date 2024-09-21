# Use Node.js 20 as the base image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your code
COPY . .

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the Node.js server
CMD ["npm", "start"]
