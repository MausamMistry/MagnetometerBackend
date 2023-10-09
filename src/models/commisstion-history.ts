import mongoose, { model, Schema } from "mongoose";

// Admin schema
export interface ICommissionHistoryModal {
    _id: mongoose.Types.ObjectId;
    admin_id: mongoose.Types.ObjectId
    user_id: mongoose.Types.ObjectId
    current_commission: string;
    old_commission: string;
    commission_sing: string;
}

const schema = new Schema<ICommissionHistoryModal>(
    {
        user_id: { type: Schema.Types.ObjectId },
        admin_id: { type: Schema.Types.ObjectId },
        current_commission: { type: String, default: "0" },
        old_commission: { type: String, default: "0" },
        commission_sing: { type: String, default: "$" },
    },
    {
        timestamps: true,
    }
);


const CommissionHistoryModal = model("commisstion_history", schema);
export default CommissionHistoryModal;
