import mongoose, { model, Schema } from "mongoose";

// Sensor schema
export interface ISensorModel {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    sensordata: {}[];
    devicetoken: string;
    address: string;
    updated_by:string,
    day:number
}

const schema = new Schema<ISensorModel>(
    {
        user_id: { type: Schema.Types.Mixed },
        sensordata: { type: Schema.Types.Mixed },
        devicetoken: { type: String },
        address: { type: String },
        updated_by:{ type: String },
        day: { type: Number }
    },
    {
        timestamps: true,
    }
);


const SensorModel = model("sensors", schema);
export default SensorModel;
