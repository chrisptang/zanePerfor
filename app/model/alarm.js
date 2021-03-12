'use strict';

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const AlarmSchema = new Schema({
        app_id: { type: String }, // app id
        status: { type: Number, default: 0 }, // 告警状态 0：刚生成,待发送  1：已发送  2: 发送中，-1:发送失败, -2:取消发送(未配置通知通道)；
        level: { type: String, default: 'warn' }, // 告警等级（warn/error）
        category: { type: String, default: 'error' }, // 告警分类（error,pvuvip,ajaxs）等，视情况；
        title: { type: String }, // 告警title
        content: { type: String }, // 告警内容
        error_message: { type: String }, // 发送异常信息
        create_time: { type: Date, default: Date.now }, // 告警生成时间
        sent_time: { type: Date }, // 告警发送结束时间
        send_start_time: { type: Date },//告警发送开始时间
    });

    AlarmSchema.index({ app_id: -1, create_time: -1 });

    return conn.model('Alarm', AlarmSchema);
};
