FROM node:19

WORKDIR /usr/src/app
COPY package*.json ./

RUN wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN npm ci --only=production
COPY . .

EXPOSE 3000
ENTRYPOINT [ "bash" ]
CMD [ "./wait-for-it.sh", "mongo-db:27017", "--", "node", "index.js" ]