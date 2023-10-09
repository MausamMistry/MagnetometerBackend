import mongoose, { model, Schema } from "mongoose";

export interface ISettingModel {
    _id: mongoose.Types.ObjectId;
    setting_name: string;
    setting_value: string;
}

const schema = new Schema<ISettingModel>(
    {
        setting_name: { type: String },
        setting_value: { type: String },
    }, {
    timestamps: true
}
);

const SettingModel = model('settings', schema);

export default SettingModel;
