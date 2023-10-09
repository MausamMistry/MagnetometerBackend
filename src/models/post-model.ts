import mongoose, { model, Schema } from "mongoose";

export interface IPostModel {
    _id: mongoose.Types.ObjectId;
    vendor_id: mongoose.Types.ObjectId;
    admin_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    type: string;
    // title: string;
    // slug: string;
    // service_provider_name: string;
    // date_time: string;
    // short_description: string;
    description: string;
    is_active: boolean;
}

const schema = new Schema<IPostModel>(
    {
        vendor_id: { type: Schema.Types.Mixed },
        user_id: { type: Schema.Types.Mixed },
        admin_id: { type: Schema.Types.Mixed },
        type: { type: String, comments: "1 for admin 2 for vendor 3 for customer" },
        // title: { type: String },
        // slug: { type: String },
        // short_description: { type: String },
        // service_provider_name: { type: String },
        // date_time: { type: String },
        description: { type: String },
        is_active: { type: Boolean, default: true },
    }, {
    timestamps: true
}
);

const PostModel = model('posts', schema);

export default PostModel;