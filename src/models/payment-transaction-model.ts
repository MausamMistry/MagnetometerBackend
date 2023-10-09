import mongoose, { model, Schema } from "mongoose";

export interface IPaymentTransactionModel {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    vendor_id: mongoose.Types.ObjectId;
    bid_id: mongoose.Types.ObjectId;
    amount: string;
    received_amount: string;
    commission_charge: string;
    status: string;
    discount: string;
    stripe_payload: string;
    stripe_request_id: string;
    transfer_reference_id: string;
    card_id: mongoose.Types.ObjectId;
    admin_percentage: string;
    vendor_percentage: string;
}
const schema = new Schema<IPaymentTransactionModel>(
    {
        user_id:  { type: Schema.Types.ObjectId },
        vendor_id:  { type: Schema.Types.ObjectId },
        bid_id:  { type: Schema.Types.ObjectId },
        card_id: { type: Schema.Types.ObjectId },
        amount: { type: String },
        received_amount: { type: String },
        commission_charge: { type: String },
        status: { type: String },
        discount: { type: String },
        stripe_payload: { type: String },
        stripe_request_id: { type: String },
        transfer_reference_id: { type: String },
        admin_percentage: { type: String },
        vendor_percentage: { type: String },
    },
    {
        timestamps: true,
    }
);

const PaymentTransactionModel = model("payment_transactions", schema);

export default PaymentTransactionModel;
