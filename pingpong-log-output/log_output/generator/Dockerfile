FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json from root
COPY log_output/package*.json ./

# Copy only the reader service source code
COPY log_output/generator ./

WORKDIR /usr/src/app/generator

RUN npm ci --omit=dev

CMD ["npm", "run", "generator"]
