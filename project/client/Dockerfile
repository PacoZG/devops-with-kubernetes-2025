FROM node:16-alpine

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package*.json ./

COPY . .

RUN npm install && npm run build

CMD [ "npm", "start" ]