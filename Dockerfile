# Production stage with Nginx
FROM nginx:alpine

# Create nginx configuration
RUN cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen 80;
    server_name localhost;
    root /var/www/html;
    index index.html index.htm;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Copy built app from build stage
COPY dist /var/www/html/

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]