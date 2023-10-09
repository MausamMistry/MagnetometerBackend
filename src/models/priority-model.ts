import mongoose, { model, Schema } from "mongoose";

export interface IPriorityModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    is_active: boolean;
}

const schema = new Schema<IPriorityModel>(
    {
        name: { type: String },
        is_active: { type: Boolean, default: true },       
    }, {
    timestamps: true
}
);

const PriorityModel = model('priorities', schema);

export default PriorityModel;