import mongoose, { model, Schema } from "mongoose";

export interface IAssetModel {
    _id: mongoose.Types.ObjectId;
    service_type_id: mongoose.Types.ObjectId;
    name: string;
    is_active: boolean;
}

// SR Walu 
const schema = new Schema<IAssetModel>(
    {
        service_type_id: { type: Schema.Types.Mixed },
        name: { type: String },
        is_active: { type: Boolean, default: true }, 
    },
    {
        timestamps: true,
    }
);

const AssetModel = model("assets", schema);

export default AssetModel;
