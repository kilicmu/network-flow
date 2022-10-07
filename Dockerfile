FROM node:14.18.1
ENV BUILD_PATH=/app/public
ENV NPM_REGISTER=http://registry.npm.taobao.org 


RUN yarn global add pnpm
WORKDIR /app
COPY ["./", "/app"]

WORKDIR /app/fe
RUN pnpm install 
RUN pnpm run build

WORKDIR /app
RUN pnpm install
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]