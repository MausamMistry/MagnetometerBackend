import mongoose, { model, Schema } from "mongoose";

export interface IserviceRequestImageModel {
    _id: mongoose.Types.ObjectId;
    service_request_id: mongoose.Types.ObjectId;
    path: string;
    type: string;
};

const schema = new Schema<IserviceRequestImageModel>(
    {
        service_request_id: { type: Schema.Types.Mixed },
        path: { type: String },
        type: { type: String },// 1 for images  2 for documnet 
    }, {
    timestamps: true
}
);

const serviceRequestImageModel = model('service_request_files', schema);

export default serviceRequestImageModel;