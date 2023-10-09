import mongoose, { model, Schema } from "mongoose";

export interface ICategoriesModel {
    _id: mongoose.Types.ObjectId;
    parent_id: mongoose.Types.ObjectId;
    name: string;
    is_active: boolean;
}

const schema = new Schema<ICategoriesModel>(
    {
        parent_id: { type: Schema.Types.Mixed },
        name: { type: String },
        is_active: { type: Boolean, default: true },       
    }, {
    timestamps: true
}
);

const CategoriesModel = model('categories', schema);

export default CategoriesModel;