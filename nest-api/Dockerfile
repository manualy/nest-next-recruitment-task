FROM node:18-alpine

RUN mkdir -p /user/src/app

WORKDIR /user/src/app

COPY . .

RUN yarn install

RUN yarn run build

CMD ["npx", "prisma", "generate"]

CMD ["yarn", "run", "start:dev"]