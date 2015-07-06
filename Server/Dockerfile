FROM node:0.12

WORKDIR /app

ADD . /app/

RUN npm install -y

EXPOSE 80

ENTRYPOINT [ "npm", "start" ]
