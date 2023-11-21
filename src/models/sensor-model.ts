import mongoose, { model, Schema } from "mongoose";

// Sensor schema
export interface ISensorModel {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    sensordata: string;
    devicetoken: string;
    updated_by:string

}

const schema = new Schema<ISensorModel>(
    {
        user_id: { type: Schema.Types.Mixed },
        sensordata: { type: String },
        devicetoken: { type: String },
        updated_by:{ type: String }
    },
    {
        timestamps: true,
    }
);


const SensorModel = model("sensors", schema);
export default SensorModel;
