import mongoose, { model, Schema } from "mongoose";

// Admin schema
export interface IUserModel {
    _id: mongoose.Types.ObjectId;
    stripe_user_id: String;
    stripe_payload: String;
    unique_id: String;
    first_name: String;
    type: String;
    last_name: String;
    user_name: String;
    date_of_birth: String;
    location: String;
    mobile_no: String;
    email: String;
    is_verified: boolean;
    password: String;
    profile_photo: String;
    upload_brochure: String;
    is_active: boolean;
    email_is_active: boolean;
    firebase_is_active: boolean;
    current_commission: string;
    commission_sing: string;
    wallet_amount: string;
    service_type_id: mongoose.Types.ObjectId;
    company_name: string;
    updated_by:string

}

const schema = new Schema<IUserModel>(
    {
        unique_id: { type: String },
        company_name: { type: String },
        service_type_id: { type: Schema.Types.ObjectId },
        first_name: { type: String },
        stripe_user_id: { type: String },
        stripe_payload: { type: String },
        type: { type: String }, // 1 for customer 2 for service providers
        last_name: { type: String },
        user_name: { type: String },
        date_of_birth: { type: String },
        location: { type: String },
        mobile_no: { type: String },
        email: { type: String },
        is_verified: { type: Boolean, default: false },
        password: { type: String },
        profile_photo: { type: String },
        upload_brochure: { type: String },
        is_active: { type: Boolean, default: true },
        email_is_active: { type: Boolean, default: true },
        firebase_is_active: { type: Boolean, default: true },
        current_commission: { type: String, default: "0" },
        commission_sing: { type: String },
        wallet_amount: { type: String, default: "0" },
        updated_by:{type:String}
    },
    {
        timestamps: true,
    }
);


const UserModel = model("users", schema);
export default UserModel;
