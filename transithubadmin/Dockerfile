# Step 1: Build the React app
FROM node:20 AS build
WORKDIR /app
COPY package.json ./ 
RUN npm install
COPY . ./
RUN npm run build

# Step 2: Use nginx to serve the built app
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Update NGINX to listen on port 8080
RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf

# Expose port 8080 to match Cloud Run's expected port
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
