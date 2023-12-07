import mongoose, { model, Schema } from "mongoose";

// Admin schema
export interface IAdminModel {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    first_name: string;
    last_name: string;  
    profile_photo: object;
    is_admin: string;
    role_id: mongoose.Types.ObjectId;   
    is_active: string;
    mobile_no : string;
    updated_by: string;
}

const schema = new Schema<IAdminModel>(
    {
        email: { type: String },
        password: { type: String, required: false },
        first_name: { type: String },
        last_name: { type: String },
        profile_photo: { type: Object },
        is_admin: { type: String },
        role_id: { type: Schema.Types.Mixed, required: true },     
        is_active: { type: String, default: 'false' },
        mobile_no:{ type: String },
        updated_by: { type: String }
    },
    {
        timestamps: true
    }
);

const AdminsModel = model('admins', schema);
export default AdminsModel;
