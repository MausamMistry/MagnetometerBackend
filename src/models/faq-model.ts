import mongoose, { model, Schema } from "mongoose";

export interface IFaqModel {
    _id: mongoose.Types.ObjectId;
    question: string;
    answer: string;
    is_active: boolean;
}

const schema = new Schema<IFaqModel>(
    {
        question: { type: String },
        answer: { type: String },
        is_active: { type: Boolean, default: true },
    }, {
    timestamps: true
}
);

const FaqModel = model('faqs', schema);

export default FaqModel;
