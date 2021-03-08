FROM  node:15.11.0-slim

ENV MONGO_HOST 'localhost'
ENV MONGO_USER 'root'
ENV MONGO_PASSWORD ''

ENV REDIS_HOST 'localhost'
ENV REDIS_USER 'root'
ENV REDIS_PASSWORD ''
ENV DINGTALK_BOT 'https://dingtalk-bot-url/?accessToken=foo'

COPY . /app
WORKDIR /app
RUN npm install
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone
RUN chmod +x /app/docker-start.sh
EXPOSE 7001
CMD /app/docker-start.sh