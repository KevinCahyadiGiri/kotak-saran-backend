FROM node:12.4.0

WORKDIR /usr/src/app

COPY . ./

RUN npm install

CMD "npm start"