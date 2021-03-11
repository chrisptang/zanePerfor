'use strict';

const Controller = require('egg').Controller;

class AlarmController extends Controller {

    // 获取某个应用的告警列表
    async getAppAlarms() {
        const { ctx } = this;
        const query = ctx.request.query;
        const appId = query.appId;
        const startDate = query.startDate;
        const endDate = query.endDate;
        const pageNo = query.pageNo;
        const pageSize = query.pageSize;

        if (!appId) throw new Error('告警列表：appId不能为空');

        const result = await ctx.service.alarms.getList(pageNo, pageSize, appId, startDate, endDate);

        ctx.body = this.app.result({
            data: result,
        });
    }

    async delete() {
        const { ctx } = this;
        const query = ctx.request.body;
        const id = query.id;

        if (!id) throw new Error('删除告警：id不能为空!');

        const result = await ctx.service.alarms.delete(id);

        ctx.body = this.app.result({
            data: result,
        });
    }
}

module.exports = AlarmController;
