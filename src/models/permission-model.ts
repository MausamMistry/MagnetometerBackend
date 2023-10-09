import mongoose, { model, Schema } from "mongoose";

// Permission schema
export interface IPermissionModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    module: string;
    position: string;
    parent: string;  
    guard_name: string;  
    is_active: boolean;
}

const schema = new Schema<IPermissionModel>(
    {
        name: { type: String },       
        module: { type: String },
        position: { type: String },
        parent: { type: String },     
        guard_name: { type: String },  
        is_active: { type: Boolean, default: false },
    },
    {
        timestamps: true
    }
);

const PermissionsModel = model('permissions', schema);
export default PermissionsModel;
