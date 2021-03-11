'use strict';

const Service = require('egg').Service;
const parser = require('cron-parser');

class AlarmsService extends Service {

    /*
     * 获取某个应用在某一段时间内的告警列表；
     *
     * @param {*} pageNos
     * @param {*} pageSize
     * @param {*} appId
     * @param {*} startDate
     * @param {*} endDate
     * @returns
     * @memberof AlarmsService
     */
    async getList(pageNos, pageSize, appId, startDate, endDate) {
        pageNos = pageNos * 1;
        pageSize = pageSize * 1;

        const query = {};
        if (appId) query.app_id = appId;
        if (!startDate) {
            let now = new Date();
            startDate = now.setDate(now.getDate() - 2);
        } else {
            startDate = new Date(startDate);
        }
        endDate = endDate ? new Date(endDate) : new Date();

        query.create_time = { $gte: startDate, $lte: endDate };

        const count = Promise.resolve(this.ctx.model.Alarm.count(query).exec());
        const alarmList = Promise.resolve(
            this.ctx.model.Alarm.find(query).skip((pageNos - 1) * pageSize)
                .limit(pageSize)
                .exec()
        );
        const all = await Promise.all([count, alarmList]);
        const list = all[1] || [];
        return {
            datalist: list,
            totalNum: all[0],
            pageNo: pageNos,
        };
    }

    /*
     * 获取某个应用的待发送告警列表；
     *
     * @param {*} appId
     * @returns
     * @memberof AlarmsService
     */
    async getPendingList(appId) {
        if (!appId) throw new Error("App id could not be empty");
        const query = { app_id: appId, status: 0 };

        return await this.ctx.model.Alarm.find(query)
            .limit(20)
            .sort('create_time')
            .exec();
    }

    /*
     * 为某个应用生成error的告警；
     *
     * @param {*} appId
     * @returns
     * @memberof AlarmsService
     */
    async generateErrorAlarmsForApp(appId) {
        if (!appId) throw new Error("App id could not be empty");
        let timeInterval = 5;//5 minutes be default.
        if (this.config.alarm.timeInterval) timeInterval = this.config.alarm.timeInterval;
        let warningThreshold = 10;
        if (this.config.alarm.warningThreshold) warningThreshold = this.config.alarm.warningThreshold;

        const alarmCreateTime = Date.now;

        const errorsModel = await this.ctx.model[`web_errors_${appId}`];
        const groupedErrors = await errorsModel.aggregate([
            { $match: { app_id: appId, create_time: { $gte: new Date(alarmCreateTime - timeInterval * 1000 * 60) } } },
            {
                $group: {
                    _category: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        if (groupedErrors.length > 0) {
            let totalErrors = 0;
            let content = groupedErrors.map(group => {
                totalErrors += group.count;
                return `${group._category}:${group.count} 次`;
            }).join(", ");
            content = `应用[${appId}] 发生脚本异常[ ${content} ]，告警时间：${new Date(alarmCreateTime)}，告警间隔：${timeInterval} 分钟`;
            const title = '脚本异常告警', category = 'web_errors', level = totalErrors > warningThreshold ? "error" : "warn";

            const result = await this.addAlarm({ title, appId, content, category, level });
            return result;
        } else {
            console.warn(`app:${appId} looks great, no errors.`);
        }
        return 0;
    }

    /*
     * @param {*} alarm {title, appId, content, category, level}
     * @returns
     * @memberof AlarmsService
     */
    async addAlarm(alarm) {
        let { title, appId, content, category, level } = alarm;
        const alarms = this.ctx.model.Alarm();
        alarms.app_id = appId;
        alarms.title = title;
        alarms.content = content;
        alarms.category = category;
        alarms.level = level;

        return await alarms.save();
    }

    /*
     *
     * @param {*} id
     * @returns
     * @memberof AlarmsService
     */
    async delete(id) {
        return await this.ctx.model.Alarm.findOneAndRemove({ _id: id }).exec();
    }

    /*
     * 发送某一告警；
     *
     * @param {*} id
     * @returns
     * @memberof AlarmsService
     */
    async sendAlarm(id) {
        // 更新为发送中
        let alarm = await this.ctx.model.Alarm.findById(id);
        if (!alarm || alarm.status != 0) {
            throw new Error(`sendAlarm failed, ID:${id}, alarm not found or status is not 0.`);
        }
        let updateRet = await this.ctx.model.Alarm.findByIdAndUpdate(id, { status: 2 }).exec();
        const system = await this.ctx.service.system.getSystemForAppId(alarm.app_id);
        let { system_name } = system;
        let alarmTitle = `【${system_name}】告警【${alarm.title}】`;
        let { url } = this.app.config.dintalk_bot;
        const json = { 'msgtype': 'text', 'text': { 'content': `${alarmTitle} ${alarm.content}` } };
        if (url) {
            const sendResult = await ctx.curl(url, {
                method: 'POST',
                contentType: 'json',
                data: json,
                dataType: 'json',
                timeout: 8000,
            });
            if (sendResult.status !== 200) {
                return await this.ctx.model.Alarm.findByIdAndUpdate(id, { status: 1 }).exec();
            } else {
                return await this.ctx.model.Alarm.findByIdAndUpdate(id, { status: -1, sent_time: new Date() }).exec();
            }
        } else {
            return await this.ctx.model.Alarm.findByIdAndUpdate(id, { status: -2 }).exec();
        }
    }

    /*
     * 超过历史pv流量峰值时发送邮件
     *
     * @param {*} [json={}]
     * @returns
     * @memberof AlarmsService
     */
    async _deprecated(json = {}) {
        const { appId, pv, uv, ip, ajax, flow } = json;
        const highestPv = parseInt(await this.app.redis.get(`${appId}_highest_pv_tips`) || 0);
        if (pv <= highestPv || !pv) return;
        this.app.redis.set(`${appId}_highest_pv_tips`, pv);

        const systemMsg = await this.ctx.service.system.getSystemForAppId(appId);
        if (systemMsg.is_use !== 0 && systemMsg.is_highest_use !== 0) return;

        // 计算定时任务间隔
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        const timer_1 = new Date(interval.prev().toString()).getTime();
        const timer_2 = new Date(interval.prev().toString()).getTime();
        const betTime = Math.abs(timer_1 - timer_2) / 1000 / 60;

        const from = `${systemMsg.system_name}应用在${betTime}分钟内突破历史流量峰值啦~`;
        const to = systemMsg.highest_list.toString();
        const day = this.app.format(new Date(), 'yyyy/MM/dd hh:mm:ss');

        const mailOptions = {
            from: `${from}<${this.app.config.email.client.auth.user}>`,
            to,
            subject: day,
            html: `
                    <div style="fong-size:25px;text-align:center;margin:50px 0 30px;">${systemMsg.system_name}应用在${betTime}分钟内突破历史流量峰值啦~</div>
                    <div style="margin-bottom:20px;">${day}</div>
                    <div style="margin-bottom:20px;">AJAX请求量：${ajax || 0}</div>
                    <div style="margin-bottom:20px;">PV请求量：${pv || 0}</div>
                    <div style="margin-bottom:20px;">UV请求量：${uv || 0}</div>
                    <div style="margin-bottom:20px;">IP请求量：${ip || 0}</div>
                    <div style="margin-bottom:20px;">流量消费：${this.app.flow(flow) || 0}</div>
                `,
        };
        this.app.email.sendMail(mailOptions);
    }

}

module.exports = AlarmsService;
