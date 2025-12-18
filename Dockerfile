FROM node:20-alpine

WORKDIR /app

# Install bash
RUN apk add --no-cache bash

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
COPY wait-for-it.sh ./
RUN chmod +x wait-for-it.sh

EXPOSE 5000

CMD ["./wait-for-it.sh", "mysql:3306", "--", "node", "index.js"]
