FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base AS development

RUN apk add --no-cache openssl git

COPY . .

RUN npm install 

ARG DATABASE_URL
RUN DATABASE_URL=$DATABASE_URL npx prisma generate

CMD ["npm", "run", "dev"]