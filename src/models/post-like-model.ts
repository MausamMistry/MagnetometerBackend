import mongoose, { model, Schema } from "mongoose";

export interface IpostLikeModel {
    _id: mongoose.Types.ObjectId;
    post_id: mongoose.Types.ObjectId;
    vendor_id: mongoose.Types.ObjectId;
    admin_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    type: string;
    is_active: boolean;
};

const schema = new Schema<IpostLikeModel>(
    {
        post_id: { type: Schema.Types.Mixed, required: true },
        vendor_id: { type: Schema.Types.Mixed },
        user_id: { type: Schema.Types.Mixed },
        admin_id: { type: Schema.Types.Mixed },
        type: { type: String, comments: "1 for admin 2 for vendor 3 for customer" },
        is_active: { type: Boolean, default: true },
    }, {
    timestamps: true
}
);

const postLikeModel = model('post_likes', schema);

export default postLikeModel;