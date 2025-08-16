FROM node:20-alpine
WORKDIR /app
COPY mentra-asuka-g1/package.json mentra-asuka-g1/package-lock.json* ./mentra-asuka-g1/
WORKDIR /app/mentra-asuka-g1
RUN npm ci
COPY mentra-asuka-g1 ./
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
