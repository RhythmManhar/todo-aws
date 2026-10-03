# Step 1: Use the official lightweight Nginx Alpine image
FROM nginx:alpine

# Step 2: Copy the static website files into Nginx default public folder
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Step 3: Inform Docker that container listens on port 80
EXPOSE 80

# Step 4: Run Nginx in foreground to keep container running
CMD ["nginx", "-g", "daemon off;"]
