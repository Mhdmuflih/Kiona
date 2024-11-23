# node js image
FROM node:20

# this is working directry
WORKDIR /app

# this is the copy of the package.json & package.lock.json
COPY package*.json ./


RUN npm install

# copy of the entire application
COPY . .

# expose the application port(main server port)
EXPOSE 8000

# start the application
CMD ["node", "server.js"]
