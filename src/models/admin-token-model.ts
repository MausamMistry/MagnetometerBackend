import mongoose, { model, Schema } from "mongoose";

export interface IAdminTokenModel {
    _id: mongoose.Types.ObjectId;
    admin_id: mongoose.Types.ObjectId;
    token: string;
    firebase_token: string;
    is_active: boolean;
};

const schema = new Schema<IAdminTokenModel>(
    {
        admin_id: {type: Schema.Types.Mixed,required: true},
        token: {type: String},
        firebase_token: {type: String},
        is_active: {type: Boolean,default: true},
    },{
        timestamps: true
    }
);

const AdminTokenModel = model('admin_tokes',schema);

export default AdminTokenModel;