import mongoose, { model, Schema } from "mongoose";

export interface IbidRequestAttachmentModel {
    _id: mongoose.Types.ObjectId;
    bid_request_id: mongoose.Types.ObjectId;
    path: string;
    type: string;
};

const schema = new Schema<IbidRequestAttachmentModel>(
    {
        bid_request_id: { type: Schema.Types.Mixed },
        path: { type: String },
        type: { type: String },// 1 for images  2 for documnet 
    }, {
    timestamps: true
}
);

const bidRequestAttachmentModel = model('bid_request_files', schema);

export default bidRequestAttachmentModel;