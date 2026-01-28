# Build Stage
FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG AVIATION_STACK_KEY
ENV AVIATION_STACK_KEY=$AVIATION_STACK_KEY

COPY . .
RUN npm run build

# Production Stage
FROM nginxinc/nginx-unprivileged:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
