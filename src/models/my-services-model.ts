import mongoose, { model, Schema } from "mongoose";

export interface IServiceTypeModel {
    _id: mongoose.Types.ObjectId;
    description:string;
    services:Array<mongoose.Types.ObjectId>;
    vendor_id:mongoose.Types.ObjectId;
    notes:string;
    is_active: boolean;
}

const schema = new Schema<IServiceTypeModel>(
    {
       description:{type:String},
       services:[{type:Schema.Types.ObjectId}],
       vendor_id:{ type: Schema.Types.ObjectId },
       notes:{type:String},
        is_active: { type: Boolean, default: true },       
    }, {
    timestamps: true
}
);

const ServiceTypeModel = model('my-services', schema);

export default ServiceTypeModel;