import mongoose, { model, Schema } from "mongoose";

// Admin schema
export interface IAdminModel {
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

const schema = new Schema<IAdminModel>(
    {
        email: { type: String },
        password: { type: String, required: false },
        first_name: { type: String },
        last_name: { type: String },     
        profile_photo: { type: String },      
        role_id: { type: Schema.Types.Mixed, required: true },     
        is_active: { type: Boolean, default: false }, 
        mobile_no:{type:String}    
    },
    {
        timestamps: true
    }
);

const AdminsModel = model('admins', schema);
export default AdminsModel;
