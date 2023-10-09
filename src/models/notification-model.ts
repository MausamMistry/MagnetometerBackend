import mongoose, { model, Schema } from "mongoose";

export interface INotificationModel {
    _id: mongoose.Types.ObjectId;
    admin_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    type: string;
    title: string;
    message: string;
    payload: string;
    is_read: Boolean;
    is_active: boolean;
}

const schema = new Schema<INotificationModel>(
    {
        user_id: { type: Schema.Types.Mixed },
        admin_id: { type: Schema.Types.Mixed },
        type: { type: String, comments: "1 for admin 2 for vendor 3 for customer" },
        title: { type: String },
        message: { type: String },
        is_read: { type: Boolean, default: false },
        payload: { type: String },
        is_active: { type: Boolean, default: true },
    }, {
    timestamps: true
}
);

const NotificationModel = model('notifications', schema);

export default NotificationModel;