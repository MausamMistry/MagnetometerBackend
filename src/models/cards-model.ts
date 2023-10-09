import mongoose, { model, Schema } from "mongoose";

export interface ICardModel {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    stripe_card_id: string;
    stripe_payload: string;
    card_no: string;
    source: string;
    brand: string;
    exp_month: string;
    exp_year: string;
    funding: string;
    last4: string;
    security_code: string;
    number:string;
    is_default: boolean;
}

const schema = new Schema<ICardModel>(
    {
        user_id: { type: Schema.Types.Mixed },
        stripe_card_id: { type: String },
        stripe_payload: { type: String },
        card_no: { type: String },
        source: { type: String },
        brand: { type: String },
        exp_month: { type: String },
        exp_year: { type: String },
        funding: { type: String },
        last4: { type: String },
        security_code: { type: String },
        number:{type:String},
        is_default: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const CardModel = model("cards", schema);

export default CardModel;
