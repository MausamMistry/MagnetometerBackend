import mongoose, { model, Schema } from "mongoose";

export interface IvisitReqModel {
  _id: mongoose.Types.ObjectId;
  vendor_id: mongoose.Types.ObjectId;
  service_request_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  interest: string;
  your_message: string;
  justification: string;
  response_date: Date;
  is_active: boolean;
  title:string;
  platform_statement:string;
}

const schema = new Schema<IvisitReqModel>(
  {
    vendor_id: { type: Schema.Types.ObjectId },
    service_request_id: { type: Schema.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId },
    interest: { type: String },
    your_message: { type: String },
    justification: { type: String },
    response_date: { type: Date },
    is_active: { type: Boolean, default: true },
    title:{type:String},
    platform_statement:{type:String},
  },
  {
    timestamps: true,
  }
);

const visitReqModel = model("visit_requests", schema);

export default visitReqModel;
