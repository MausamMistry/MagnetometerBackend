import mongoose, { model, Schema } from "mongoose";

export interface IUserTokenModel {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    token: string;
    firebase_token: string;
    is_active: boolean;
};

const schema = new Schema<IUserTokenModel>(
    {
        user_id: {type: Schema.Types.Mixed,required: true},
        token: {type: String},
        firebase_token: {type: String},
        is_active: {type: Boolean,default: true},
    },{
        timestamps: true
    }
);

const UserTokenModel = model('user_tokes',schema);

export default UserTokenModel;