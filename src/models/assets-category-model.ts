import mongoose, { model, Schema } from "mongoose";

export interface IAssetCategoriesModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    is_active: boolean;
}
//  My Assets DroupDown
const schema = new Schema<IAssetCategoriesModel>(
    {
        name: { type: String },
        is_active: { type: Boolean, default: true },       
    }, {
    timestamps: true
}
);

const AssetCategoriesModel = model('asset_categories', schema);

export default AssetCategoriesModel;