import mongoose, { model, Schema } from "mongoose";

export interface IpostImageModel {
    _id: mongoose.Types.ObjectId;
    post_id: mongoose.Types.ObjectId;
    image: string;
};

const schema = new Schema<IpostImageModel>(
    {
        post_id: { type: Schema.Types.Mixed },
        image: { type: String },
    }, {
    timestamps: true
}
);

const postImageModel = model('post_images', schema);

export default postImageModel;