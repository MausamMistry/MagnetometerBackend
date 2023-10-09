import mongoose, { model, Schema } from "mongoose";

export interface IComplishmentReportModel {
    _id: mongoose.Types.ObjectId;
    service_request_id: mongoose.Types.ObjectId;
    vendor_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    completion_date: string;
    note: string;
    issue: string;
    photo: string;
    document: string;
    status: string;
    customer_note: string;
}

const schema = new Schema<IComplishmentReportModel>(
    {
        service_request_id: { type: Schema.Types.ObjectId },
        vendor_id: { type: Schema.Types.ObjectId },
        user_id: { type: Schema.Types.ObjectId },
        completion_date: { type: String },
        note: { type: String },
        issue: { type: String },
        customer_note: { type: String },
        document: { type: String },
        photo: { type: String },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

const ComplishmentReportModel = model("complishment_reports", schema);

export default ComplishmentReportModel;
