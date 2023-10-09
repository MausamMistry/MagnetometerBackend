import mongoose, { model, Schema } from "mongoose";

export interface IOurContactUsModel {
    _id: mongoose.Types.ObjectId;
    key: string;
    value: string;
}

const schema = new Schema<IOurContactUsModel>(
    {
        key: { type: String },
        value: { type: String },
    }, {
    timestamps: true
}
);

const OurContactUsModel = model('our_contact_us', schema);

export default OurContactUsModel;
