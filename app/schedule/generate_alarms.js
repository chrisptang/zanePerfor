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
            app.logger.info('生成所有app的告警任务启动ing...');
            const app_list = await ctx.model.System.find({ is_use: 0 }).exec();
            if (app_list && app_list.length > 0) {
                app_list.forEach(app => {
                    app.logger.info(`app:${app.app_id}的生成告警任务启动ing...`);
                    const result = await ctx.service.alarm.generateAlarmsForApp(app.app_id);
                    app.logger.info(`app:${app.app_id}的生成告警任务结果:${result}`);
                });
            }
        },
    };
};
