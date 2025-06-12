FROM node:22-alpine

WORKDIR /usr/src/app

COPY package* ./

RUN npm install --quiet

COPY . .

EXPOSE 3001

CMD ["npm", "run", "server"]
