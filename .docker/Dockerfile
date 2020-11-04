FROM keymetrics/pm2:12-alpine
RUN apk add curl
WORKDIR /root/app
EXPOSE 8080 8081
COPY . .
COPY .docker/run.sh run.sh

CMD ["./run.sh"]