import mongoose, { model, Schema } from "mongoose";

export interface IServiceTypeModel {
    _id: mongoose.Types.ObjectId;
    name: string;
    icon:string;
    description:string,
    is_active: boolean;
}

const schema = new Schema<IServiceTypeModel>(
    {
        name: { type: String },
        icon:{type:String},
        description:{type:String},
        is_active: { type: Boolean, default: true },       
    }, {
    timestamps: true
}
);

const ServiceTypeModel = model('service_type', schema);

export default ServiceTypeModel;