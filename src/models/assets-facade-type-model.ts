import mongoose, { model, Schema } from "mongoose";

export interface IAssetFacadeTypeModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    is_active: boolean;
}
//  My Assets DroupDown

const schema = new Schema<IAssetFacadeTypeModel>(
    {
        name: { type: String },
        is_active: { type: Boolean, default: true },       
    }, {
    timestamps: true
}
);

const AssetFacadeTypeModel = model('asset_facade_type', schema);

export default AssetFacadeTypeModel;