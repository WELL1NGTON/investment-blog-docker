FROM node:12.19

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# RUN npm install -g yarn
RUN yarn install

# Bundle app source
COPY . .

EXPOSE 5000

CMD [ "yarn", "dev:server" ]
