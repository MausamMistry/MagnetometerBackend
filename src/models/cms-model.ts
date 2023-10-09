import mongoose, { model, Schema } from "mongoose";

export interface ICmsModel {
    _id: mongoose.Types.ObjectId;
    key: string;
    value: string;
}

const schema = new Schema<ICmsModel>(
    {
        key: { type: String },
        value: { type: String },
    }, {
    timestamps: true
}
);

const CmsModel = model('cms', schema);

export default CmsModel;
