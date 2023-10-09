import mongoose, { model, Schema } from "mongoose";

export interface ICancelReasonModel {
    _id: mongoose.Types.ObjectId;
    close_reason: mongoose.Types.ObjectId;
    close_note: string;
    service_request_id: mongoose.Types.ObjectId;
    is_active: boolean;
}

const schema = new Schema<ICancelReasonModel>(
    {
        close_reason: { type: Schema.Types.ObjectId },
        close_note: { type: String },
        service_request_id: { type: Schema.Types.ObjectId },
        is_active: { type: Boolean, default: true },
    }, {
    timestamps: true
}
);

const CancelServiceRequestModel = model('cancel_service_request', schema);

export default CancelServiceRequestModel;