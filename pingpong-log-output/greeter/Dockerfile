FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8001

CMD ["npm", "start"]
