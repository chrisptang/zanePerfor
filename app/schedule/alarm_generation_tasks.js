'use strict';

// 定时生成告警
module.exports = app => {
    return {
        schedule: {
            cron: app.config.alarm_generate_task_time,
            type: 'worker',
            disable: false,
        },
        async task(ctx) {
            ctx.app.logger.info('生成所有app的告警任务启动ing...');
            const app_list = await ctx.model.System.find({ is_use: 0 }).exec();
            if (app_list && app_list.length > 0) {
                for (let i = 0; i < app_list.length; i++) {
                    let app = app_list[i];
                    ctx.app.logger.info(`app:${app.app_id}的生成告警任务启动ing...`);
                    const result = await ctx.service.alarms.generateErrorAlarmsForApp(app.app_id);
                    ctx.app.logger.info(`app:${app.app_id}的生成告警任务结果:${result}`);
                }
            }
        },
    };
};
