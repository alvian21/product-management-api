# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Install PM2 globally
RUN npm install -g pm2

# Bundle app source
COPY . .

# Copy the ecosystem.config.js file
COPY ecosystem.config.js .

# Expose the port the app runs on
EXPOSE 7610

# Define the command to run the app using PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]