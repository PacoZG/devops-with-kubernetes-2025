FROM node:22-alpine

WORKDIR /usr/src/app

COPY package* ./

RUN npm ci

COPY log-output .

CMD ["npm", "start"]
