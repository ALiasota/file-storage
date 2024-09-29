FROM node:18-alpine

RUN yarn global add @nestjs/cli

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 5001

CMD ["yarn", "start"]
