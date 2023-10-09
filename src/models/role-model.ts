import mongoose, { model, Schema } from "mongoose";

export interface IRoleModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    permission_name: string;
    guard_name: string;
    is_active: boolean;
}

const schema = new Schema<IRoleModel>(
    {    
        name : {type: String},
        permission_name : {type: String},
        guard_name : {type: String},
        is_active: {type: Boolean,default: false},
    },{
        timestamps: true
    }
);

const RoleModel = model('roles',schema);

export default RoleModel;