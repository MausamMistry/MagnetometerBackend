import mongoose, { model, Schema } from "mongoose";

export interface IChatModel {
    _id: mongoose.Types.ObjectId;
    admin_id: mongoose.Types.ObjectId;
    vendor_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    type: string;
    room_id: string;
    is_active: boolean;
};

const schema = new Schema<IChatModel>(
    {
        admin_id: {type: Schema.Types.Mixed},
        vendor_id: {type: Schema.Types.Mixed},
        user_id: {type: Schema.Types.Mixed},
        type: {type: String},
        room_id: {type: String},
        is_active: {type: Boolean,default: true},
    },{
        timestamps: true
    }
);

const ChatModel = model('chats',schema);

export default ChatModel;