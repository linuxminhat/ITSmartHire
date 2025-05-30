FROM node:18-alpine
WORKDIR /usr/src/app
RUN npm i -g npm@10.9.2

COPY package.json ./
RUN npm install --legacy-peer-deps        # cài TẤT CẢ deps

COPY . .
RUN npm run build                         # nest build OK
RUN npm prune --production                # gỡ devDeps, image gọn

EXPOSE 8000
CMD ["node", "dist/main"]
