import mongoose, { model, Schema } from "mongoose";

export interface ICancelReasonModel {
    _id: mongoose.Types.ObjectId;
    reson: string;
    is_active: boolean;
}

const schema = new Schema<ICancelReasonModel>(
    {
        reson: { type: String },
        is_active: { type: Boolean, default: true },
    }, {
    timestamps: true
}
);

const CancelReasonModel = model('cancel_reasons', schema);

export default CancelReasonModel;