import mongoose, { model, Schema } from "mongoose";

export interface IAssetUsesModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    is_active: boolean;
}


//  My Assets DroupDown

const schema = new Schema<IAssetUsesModel>(
    {
        name: { type: String },
        is_active: { type: Boolean, default: true },       
    }, {
    timestamps: true
}
);

const AssetUsesModel = model('asset_uses', schema);

export default AssetUsesModel;