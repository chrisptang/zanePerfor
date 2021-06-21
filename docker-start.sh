#!/bin/bash

echo "starting zanePerfor, CONFIG_HOST:$CONFIG_HOST, ENV_TYPE:$ENV_TYPE"

sed -i 's,__config_host__,'"$CONFIG_HOST"',g' /app/config/config.default.docker.js
sed -i 's,__config_cluster_listen_ip__,'"$CONFIG_CLUSTER_LISTEN_IP"',g' /app/config/config.default.docker.js
sed -i 's,__config_report_data_type__,'"$CONFIG_REPORT_DATA_TYPE"',g' /app/config/config.default.docker.js
sed -i 's,__config_redis_client_port__,'"$CONFIG_REDIS_CLIENT_PORT"',g' /app/config/config.default.docker.js
sed -i 's,__config_redis_client_host__,'"$CONFIG_REDIS_CLIENT_HOST"',g' /app/config/config.default.docker.js
sed -i 's,__config_redis_client_password__,'"$CONFIG_REDIS_CLIENT_PASSWORD"',g' /app/config/config.default.docker.js
sed -i 's,__config_db_mongo_url__,'"$CONFIG_DB_MONGO_URL"',g' /app/config/config.default.docker.js
sed -i 's,__config_password_salt__,'"$CONFIG_PASSWORD_SALT"',g' /app/config/config.default.docker.js
sed -i 's,__config_github_client_id__,'"$CONFIG_GITHUB_CLIENT_ID"',g' /app/config/config.default.docker.js
sed -i 's,__config_github_client_secret__,'"$CONFIG_GITHUB_CLIENT_SECRET"',g' /app/config/config.default.docker.js
sed -i 's,__config_wechat_client_id__,'"$CONFIG_WECHAT_CLIENT_ID"',g' /app/config/config.default.docker.js
sed -i 's,__config_wechat_client_secret__,'"$CONFIG_WECHAT_CLIENT_SECRET"',g' /app/config/config.default.docker.js
sed -i 's,__config_dingtalk_bot_url__,'"$CONFIG_DINGTALK_BOT_URL"',g' /app/config/config.default.docker.js
sed -i 's,__config_alarm_origin__,'"$CONFIG_ORIGIN"',g' /app/config/config.default.docker.js

cat /app/config/config.default.docker.js > /app/config/config.default.js

sed -i 's,__config_host__,'"$CONFIG_HOST"',g' /app/config/config.prod.docker.js
sed -i 's,__config_cluster_listen_ip__,'"$CONFIG_CLUSTER_LISTEN_IP"',g' /app/config/config.prod.docker.js
sed -i 's,__config_report_data_type__,'"$CONFIG_REPORT_DATA_TYPE"',g' /app/config/config.prod.docker.js
sed -i 's,__config_redis_client_port__,'"$CONFIG_REDIS_CLIENT_PORT"',g' /app/config/config.prod.docker.js
sed -i 's,__config_redis_client_host__,'"$CONFIG_REDIS_CLIENT_HOST"',g' /app/config/config.prod.docker.js
sed -i 's,__config_redis_client_password__,'"$CONFIG_REDIS_CLIENT_PASSWORD"',g' /app/config/config.prod.docker.js
sed -i 's,__config_db_mongo_url__,'"$CONFIG_DB_MONGO_URL"',g' /app/config/config.prod.docker.js
sed -i 's,__config_origin__,'"$CONFIG_ORIGIN"',g' /app/config/config.prod.docker.js
sed -i 's,__config_alarm_origin__,'"$CONFIG_ORIGIN"',g' /app/config/config.prod.docker.js
sed -i 's,__config_github_client_id__,'"$CONFIG_GITHUB_CLIENT_ID"',g' /app/config/config.prod.docker.js
sed -i 's,__config_github_client_secret__,'"$CONFIG_GITHUB_CLIENT_SECRET"',g' /app/config/config.prod.docker.js
sed -i 's,__config_wechat_client_id__,'"$CONFIG_WECHAT_CLIENT_ID"',g' /app/config/config.prod.docker.js
sed -i 's,__config_wechat_client_secret__,'"$CONFIG_WECHAT_CLIENT_SECRET"',g' /app/config/config.prod.docker.js

cat /app/config/config.prod.docker.js > /app/config/config.prod.js


if [ $ENV_TYPE = 'dev' ]
then 
    echo "/app/config/config.default.js" && cat /app/config/config.default.js
else     
    echo "/app/config/config.prod.js: " && cat /app/config/config.prod.js
fi

npm run $ENV_TYPE