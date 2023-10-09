import mongoose, { model, Schema } from "mongoose";

export interface IMyEarningModel {
    _id: mongoose.Types.ObjectId;
    bid_id: mongoose.Types.ObjectId;
    card_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    vendor_id: mongoose.Types.ObjectId;
    old_wallet_amount: string;
    new_wallet_amount: string;
    sp_received_amount: string;
    admin_received_amount: string;
    amount: string;
    status: string;
    transfer_reference_id: string;
    admin_percentage: string;
    vendor_percentage: string;
}
const schema = new Schema<IMyEarningModel>(
    {
        bid_id: { type: Schema.Types.ObjectId },
        card_id: { type: Schema.Types.ObjectId },
        user_id: { type: Schema.Types.ObjectId },
        vendor_id: { type: Schema.Types.ObjectId },
        old_wallet_amount: { type: String },
        new_wallet_amount: { type: String },
        sp_received_amount: { type: String },
        admin_received_amount: { type: String },
        amount: { type: String },
        status: { type: String },
        admin_percentage: { type: String },
        vendor_percentage: { type: String },
        transfer_reference_id: { type: String },
    },
    {
        timestamps: true,
    }
);

const MyEarningModel = model("my_earnings", schema);

export default MyEarningModel;
