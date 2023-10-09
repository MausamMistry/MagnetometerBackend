import mongoose, { model, Schema } from "mongoose";

// Admin schema
export interface ITrainingMaterialModel {
    _id: mongoose.Types.ObjectId;
    type: string;
    video: string;
    doc: string;
    url: string;
    title: string;
    image: string;
    description: string;  
    is_active: boolean;  
}

const schema = new Schema<ITrainingMaterialModel>(
    {
        type: { type: String },
        url: { type: String, required: false },
        video: { type: String },
        doc: { type: String },
        title: { type: String },
        description: { type: String },     
        image: { type: String },     
        is_active: { type: Boolean, default: false },     
    },
    {
        timestamps: true
    }
);

const TrainingMaterialModel = model('training_materials', schema);
export default TrainingMaterialModel;
