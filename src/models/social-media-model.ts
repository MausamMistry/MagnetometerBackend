import mongoose, { model, Schema } from "mongoose";

export interface ISocialMediaModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    value: string;
    icon: string;
}

const schema = new Schema<ISocialMediaModel>(
    {
        name: { type: String },
        value: { type: String },
        icon:{type: String}
    }, {
    timestamps: true
}
);

const SocialMediaModel = model('social_medias', schema);

export default SocialMediaModel;
