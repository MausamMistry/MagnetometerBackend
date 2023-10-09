import mongoose, { model, Schema } from "mongoose";

export interface IWhyMaintenanceModel {
    _id: mongoose.Types.ObjectId;
    field_name: string;
    field_value: string;
    icon: string;
    is_active: boolean;

}

const schema = new Schema<IWhyMaintenanceModel>(
    {
        field_name: { type: String },
        field_value: { type: String },
        icon: { type: String },
        is_active: { type: Boolean, default: true },
    }, {
    timestamps: true
}
);

const WhyMaintenanceModel = model('why_maintenances', schema);

export default WhyMaintenanceModel;
