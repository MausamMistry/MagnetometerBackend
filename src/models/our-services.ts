import mongoose, { model, Schema } from "mongoose";

export interface IOurServicesModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    img: string,
    index: number;
    is_active: boolean;
}

const schema = new Schema<IOurServicesModel>(
    {
        name: { type: String },
        img: { type: String },
        index: { type: Number },
        is_active: { type: Boolean, default: true },
    }, {
    timestamps: true
}
);

const OurServicesModel = model('our_services', schema);

export default OurServicesModel;