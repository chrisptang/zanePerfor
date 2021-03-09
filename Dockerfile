#FROM  node:15.11.0-alpine
FROM node:15.11.0

ENV MONGO_HOST 'localhost'
ENV MONGO_USER 'root'
ENV MONGO_PASSWORD ''

ENV REDIS_HOST 'localhost'
ENV REDIS_USER 'root'
ENV REDIS_PASSWORD ''
ENV DINGTALK_BOT 'https://dingtalk-bot-url/?accessToken=foo'

#环境：dev，开发环境，prod线上环境
ENV ENV_TYPE 'dev'

# 上报原始数据使用redis存储、kafka储存、还是使用mongodb存储
ENV CONFIG_REPORT_DATA_TYPE 'mongo'

ENV CONFIG_HOST 'localhost'
ENV CONFIG_CLUSTER_LISTEN_IP '127.0.0.1'
ENV CONFIG_REDIS_CLIENT_PORT '6379'
ENV CONFIG_REDIS_CLIENT_HOST 'redis'
ENV CONFIG_REDIS_CLIENT_PASSWORD ''
ENV CONFIG_DB_MONGO_URL 'mongodb://mongodb:27017/performance'
ENV CONFIG_ORIGIN 'http://localhost:7001'

ENV CONFIG_PASSWORD_SALT 'pass_salt_!QAZ'

COPY . /app
WORKDIR /app
RUN npm install
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone
RUN chmod +x /app/docker-start.sh
EXPOSE 7001
EXPOSE 7002
CMD /app/docker-start.sh