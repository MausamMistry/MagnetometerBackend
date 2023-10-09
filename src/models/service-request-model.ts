import mongoose, { model, Schema } from "mongoose";
export interface IServiceReqModel {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    location: string;
    title: string;
    slug: string;
    service_type_id: mongoose.Types.ObjectId;
    assets_id: mongoose.Types.ObjectId;
    contact_no: String;
    priority: mongoose.Types.ObjectId;
    detail: string;
    type: string;
    schedule_date: String;
    request_id: String;
    status: string;
    close_reason: mongoose.Types.ObjectId;
    close_note: string;
    close_sr_date: Date;
    accept_bid_note: string;
    upload_signature: string;
    is_admin_connect: string;
    admin_comment: string;
    dispute_id: mongoose.Types.ObjectId;
    selected_bid_id: mongoose.Types.ObjectId;
    is_deleted: boolean;
    is_expired: boolean;
    complishment_report: mongoose.Types.ObjectId;
    complishment_report_date: Date;
    is_active: boolean;
    is_payment_done: boolean;
    is_review_by_sp: boolean;
    posted_date: Date;
    awarded_date: String;
}

const schema = new Schema<IServiceReqModel>(
    {
        user_id: { type: Schema.Types.ObjectId },
        service_type_id: { type: Schema.Types.ObjectId },
        assets_id: { type: Schema.Types.ObjectId },
        dispute_id: { type: Schema.Types.ObjectId },
        complishment_report: { type: Schema.Types.ObjectId },
        title: { type: String },
        slug: { type: String },
        location: { type: String },
        detail: { type: String },
        contact_no: { type: String },
        priority: { type: Schema.Types.ObjectId }, // 1 = 'Low' 2 = 'Medium'  3 = 'Urgent' 
        type: { type: String }, // 1 = 'On Demand' , 2 = 'Scheduling',
        request_id: { type: String },
        schedule_date: { type: String },
        status: { type: String },

        // pending = 1,
        // awaiting = 2,
        // proccess = 3,
        // closed = 4,
        // completed = 5,
        // disputed = 6,
        // expride = 7,
        // awarded = 8,
        // cancelled = 9,
        // close by admin = 10,

        close_reason: { type: Schema.Types.ObjectId },
        close_note: { type: String },
        close_sr_date: { type: Date },
        upload_signature: { type: String },
        is_admin_connect: { type: String, default: '0' },
        admin_comment: { type: String, default: '' },
        accept_bid_note: { type: String },
        is_deleted: { type: Boolean, default: false },
        is_expired: { type: Boolean, default: false },
        selected_bid_id: { type: Schema.Types.ObjectId },
        complishment_report_date: { type: Date },
        is_active: { type: Boolean, default: true },
        is_payment_done: { type: Boolean, default: false },
        is_review_by_sp: { type: Boolean, default: false },
        posted_date: { type: Date },
        awarded_date: { type: String, default: 'N/A' },
    },
    {
        timestamps: true,
    }
);
const ServiceReqModel = model("service_requests", schema);

export default ServiceReqModel;
