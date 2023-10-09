import mongoose, { model, Schema } from "mongoose";

export interface IBidModel {
    _id: mongoose.Types.ObjectId;
    vendor_id: mongoose.Types.ObjectId;
    service_request_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    message_field: String;
    typical_text: String;
    amount: String;
    currency: String;
    price_breakdown: Array<any>;
    delivery_timeframe: String;
    validity: String;
    other_conditions: String;
    bidder_note: String;
    bidder_signature: String;
    signature_time: Date;
    // is_active: boolean;
    // is_selected: String;
    // status: String;
    status: String;
    reject_reason_id: mongoose.Types.ObjectId,
    reject_note: String,
    is_active: boolean;

}

const schema = new Schema<IBidModel>(
    {
        vendor_id: { type: Schema.Types.Mixed },
        service_request_id: { type: Schema.Types.ObjectId },
        user_id: { type: Schema.Types.ObjectId },
        message_field: { type: String },
        typical_text: { type: String },
        amount: { type: String },
        currency: { type: String },
        delivery_timeframe: { type: String },
        validity: { type: String },
        other_conditions: { type: String },
        bidder_note: { type: String },
        bidder_signature: { type: String },
        signature_time: { type: Date },
        // is_active: { type: Boolean, default: true },
        // is_selected: { type: String, default: '0' }, //0 id pending 1 is accept 2 is rejectd
        // status: { type: String },
        status: { type: String }, // 0 pending 1 submited 2 rejected 3 selected 4 resubmit 5 auto reject 
        reject_reason_id: { type: Schema.Types.ObjectId },
        reject_note: { type: String },
        is_active: { type: Boolean, default: true },

    },
    {
        timestamps: true,
    }
);

const BidModel = model("bids", schema);

export default BidModel;
