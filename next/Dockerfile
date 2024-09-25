FROM node:18-alpine

RUN mkdir -p /user/src/app

WORKDIR /user/src/app

COPY . .

RUN yarn install

CMD ["yarn", "run", "dev"]