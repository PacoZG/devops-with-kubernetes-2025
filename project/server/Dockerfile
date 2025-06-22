FROM node:22-alpine

WORKDIR /usr/src/app

COPY package* ./

RUN npm install --quiet

COPY . .

CMD ["npm", "run", "server"]
