import mongoose, { model, Schema } from "mongoose";

export interface IDisputeModel {
  _id: mongoose.Types.ObjectId;
  service_request_id: mongoose.Types.ObjectId;
  bid_id: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  root_cause: string;
  damages: string;
  action: string;
  document: string;
  add_response: string;
  photo: string;
  status: string;
  update: string;
}

const schema = new Schema<IDisputeModel>(
  {
    service_request_id: { types: Schema.Types.ObjectId },
    bid_id: { type: Schema.Types.ObjectId },
    category: {type: Schema.Types.ObjectId },
    root_cause: { type: String },
    damages: { type: String },
    action: { type: String },
    add_response: { type: String },
    document: { type: String },
    photo: { type: String },
    status: { type: String },  // 1 pending, 2 Resolve
    update: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

const DisputeModel = model("disputes", schema);

export default DisputeModel;
