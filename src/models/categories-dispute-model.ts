import mongoose, { model, Schema } from "mongoose";

export interface ICategoriesDisputeModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    is_active: boolean;
}

const schema = new Schema<ICategoriesDisputeModel>(
    {
        name: { type: String },
        is_active: { type: Boolean, default: true },       
    }, {
    timestamps: true
}
);

const CategoriesDisputeModel = model('categories_dispute', schema);

export default CategoriesDisputeModel;