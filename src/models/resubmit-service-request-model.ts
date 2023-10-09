import mongoose, { model, Schema } from "mongoose";

export interface IResubmitReasonModel {
    _id: mongoose.Types.ObjectId;
    date: string;
    service_request_id: mongoose.Types.ObjectId;
    is_active: boolean;
}

const schema = new Schema<IResubmitReasonModel>(
    {
        date: { type: String },
        service_request_id: { type: Schema.Types.ObjectId },
        is_active: { type: Boolean, default: true },
    }, {
    timestamps: true
}
);

const ResubmitServiceRequestModel = model('resubmit_service_requests', schema);

export default ResubmitServiceRequestModel;