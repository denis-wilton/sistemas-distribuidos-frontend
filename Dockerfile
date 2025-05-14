FROM node:20-alpine

WORKDIR /app

COPY . .

RUN rm -rf node_modules
RUN rm package-lock.json

RUN ls -la

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
