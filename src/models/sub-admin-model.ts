import mongoose, { model, Schema } from "mongoose";

// Admin schema
export interface ISubAdminModel {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    profile_photo: string;  
    role_id: mongoose.Types.ObjectId;   
    is_active: boolean;
    mobile_no : string;
}

const schema = new Schema<ISubAdminModel>(
    {
        email: { type: String },
        password: { type: String, required: false },
        first_name: { type: String },
        last_name: { type: String },     
        profile_photo: { type: String },      
        role_id: { type: Schema.Types.Mixed },
        is_active: { type: Boolean, default: false }, 
        mobile_no:{type:String, required: true }
    },
    {
        timestamps: true
    }
);

const AdminsModel = model('sub_admins', schema);
export default AdminsModel;
