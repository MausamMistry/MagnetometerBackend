import mongoose, { model, Schema } from "mongoose";

export interface IReportRequestModel {
  _id: mongoose.Types.ObjectId;
  from_user_id: mongoose.Types.ObjectId;
  to_user_id: mongoose.Types.ObjectId;
  is_active: Boolean;
}

const schema = new Schema<IReportRequestModel>(
  {
    from_user_id: { type: Schema.Types.Mixed },
    to_user_id: { type: Schema.Types.Mixed },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const ReportRequestModel = model("report_request", schema);

export default ReportRequestModel;
