FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base AS development
RUN npm install

COPY . .

ARG DATABASE_URL

RUN DATABASE_URL=$DATABASE_URL npx prisma generate

CMD ["npm", "run", "dev"]