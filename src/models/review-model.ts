import mongoose, { model, Schema } from "mongoose";

export interface IReviewModel {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  vendor_id: mongoose.Types.ObjectId;
  bid_id: mongoose.Types.ObjectId;
  service_request_id: mongoose.Types.ObjectId;
  service_status: string;
  rating_workmanship: number;
  rating_materials: number;
  rating_timeframe: number;
  rating_behavior: number;
  rating_overall: number;
  review: string;
}

const schema = new Schema<IReviewModel>(
  {
    user_id: { type: Schema.Types.Mixed },
    vendor_id: { type: Schema.Types.ObjectId },
    bid_id: { type: Schema.Types.ObjectId },
    service_request_id: { type: Schema.Types.ObjectId },
    service_status: { type: String },
    rating_workmanship: { type: Number },
    rating_materials: { type: Number },
    rating_timeframe: { type: Number },
    rating_behavior: { type: Number },
    rating_overall: { type: Number },
    review: { type: String },
  },
  {
    timestamps: true,
  }
);

const ReviewModel = model("reviews", schema);

export default ReviewModel;
