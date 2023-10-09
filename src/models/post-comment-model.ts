import mongoose, { model, Schema } from "mongoose";

export interface IPostCommentModel {
    _id: mongoose.Types.ObjectId;
    post_id: mongoose.Types.ObjectId;
    vendor_id: mongoose.Types.ObjectId;
    admin_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    type: string;
    comment: string;
    is_active: boolean;
};

const schema = new Schema<IPostCommentModel>(
    {
        post_id: { type: Schema.Types.Mixed },
        vendor_id: { type: Schema.Types.Mixed },
        user_id: { type: Schema.Types.Mixed },
        admin_id: { type: Schema.Types.Mixed },
        type: { type: String, comments: "1 for admin 2 for vendor 3 for customer" },
        comment: { type: String },
        is_active: {type: Boolean,default: true},
    },{
        timestamps: true
    }
);

const PostCommentModel = model('post_comments',schema);

export default PostCommentModel;