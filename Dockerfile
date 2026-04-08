# Production stage with Nginx
FROM nginx:alpine

# 1. 템플릿 파일을 Nginx 템플릿 폴더로 복사
COPY default.conf.template /etc/nginx/templates/default.conf.template

# 2. 빌드된 앱 파일 복사
COPY dist /var/www/html/

# 포트 설정
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]