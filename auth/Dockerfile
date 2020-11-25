FROM  node:alpine
ENV CI=true
WORKDIR /app

COPY package.json .
COPY yarn.lock .

#RUN yarn install --only=prod
RUN yarn install

COPY . .

CMD ["yarn", "start"]
