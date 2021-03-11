'use strict';

// 定时生成告警
module.exports = app => {
    return {
        schedule: {
            cron: app.config.alarm_generate_task_time,
            type: 'worker',
            disable: false,
        },
        // 定时处理上报的数据 db1同步到db3数据
        async task(ctx) {
            console.info('发送所有的告警任务启动ing...');
            const app_list = await ctx.model.System.find({ is_use: 0 }).exec();
            if (app_list && app_list.length > 0) {
                for (let i = 0; i < app_list.length; i++) {
                    let app = app_list[i];
                    console.info(`app:${app.app_id}的生成告警发送任务启动ing...`);
                    const alarm_list = await ctx.service.alarms.getPendingList(app.app_id);
                    if (alarm_list && alarm_list.length > 0) {
                        alarm_list.forEach(async (element) => {
                            const sendResult = await ctx.service.alarms.sendAlarm(element._id);
                            console.warn(`alarm id:${element._id}, send result:${sendResult}`);
                        });
                    }
                }
            }
        },
    };
};
