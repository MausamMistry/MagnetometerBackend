import mongoose, { model, Schema } from "mongoose";

export interface IassetImagesModel {
    _id: mongoose.Types.ObjectId;
    asset_id: mongoose.Types.ObjectId;
    image: string;
};

const schema = new Schema<IassetImagesModel>(
    {
        asset_id: { type: Schema.Types.Mixed },
        image: { type: String },
    }, {
    timestamps: true
}
);

const assetImagesModel = model('asset_images', schema);

export default assetImagesModel;