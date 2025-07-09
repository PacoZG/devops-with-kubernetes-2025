FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json from root
COPY log_output/package*.json ./

# Copy only the reader service source code
COPY log_output/reader ./

WORKDIR /usr/src/app/reader

RUN npm ci --omit=dev

CMD ["npm", "run", "reader"]
