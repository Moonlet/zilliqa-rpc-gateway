FROM node:14-alpine
ENV NODE_ENV=production

ADD . /app

WORKDIR /app

RUN yarn install --production