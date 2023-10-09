import mongoose, { model, Schema } from "mongoose";

// Admin schema
export interface IContactUsModel {
    _id: mongoose.Types.ObjectId;
    email: string;
    location: string;
    name: string;
    mobile_no: string; 
    subject:string; 
    message: string;  
    images: string;  
    user_id: mongoose.Types.ObjectId;   
    is_active: boolean;  
}

const schema = new Schema<IContactUsModel>(
    {
        email: { type: String },
        location: { type: String },
        name: { type: String },
        mobile_no: { type: String },
        subject: { type: String },     
        message: { type: String },      
        images: { type: String },      
        user_id: { type: Schema.Types.Mixed },     
        is_active: { type: Boolean, default: false },     
    },
    {
        timestamps: true
    }
);

const ContactUsModel = model('contact_us', schema);
export default ContactUsModel;
