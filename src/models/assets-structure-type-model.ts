import mongoose, { model, Schema } from "mongoose";

export interface IAssetStructureTypeModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    is_active: boolean;
}
//  My Assets DroupDown

const schema = new Schema<IAssetStructureTypeModel>(
    {
        name: { type: String },
        is_active: { type: Boolean, default: true },       
    }, {
    timestamps: true
}
);

const AssetStructureModel = model('asset_structure_type', schema);

export default AssetStructureModel;