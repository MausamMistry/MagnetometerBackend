import mongoose, { model, Schema } from "mongoose";

// Admin schema
export interface IOtpModel {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  admin_id: mongoose.Types.ObjectId;
  otp: string;
  token: string;
  expiry: Date;
  is_active: boolean;
  is_verified: boolean;
}

const schema = new Schema<IOtpModel>(
  {
    user_id: { type: Schema.Types.ObjectId },
    admin_id: { type: Schema.Types.ObjectId },
    token: { type: String },
    otp: { type: String },
    expiry: { type: Date },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const OtpModel = model("otp", schema);
export default OtpModel;
