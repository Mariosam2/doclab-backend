FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY prisma ./prisma

COPY  .  .


RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm run dev"]