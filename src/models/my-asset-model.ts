import mongoose, { model, Schema } from "mongoose";

export interface IMyAssetModel {
    _id: mongoose.Types.ObjectId;
    title: string;
    category_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    asset_uses_id:mongoose.Types.ObjectId;
    structural_type_id: mongoose.Types.ObjectId;
    facade_type_data_id: mongoose.Types.ObjectId;
    description: string;
    year_built: string;
    gross_area: string;
    build_area: string;
    build_cost: string;
    current_value: string;
    current_issues: string;
    Previous_issue: string;
    is_active: boolean;
    general_rating: string;
    structural_rating: string;
    cleanliness_rating: string;
    fitout_rating: string;
    floors_rating: string;
    doors_rating: string;
    windows_rating: string;
    wall_partitionin_rating: string;
    secondary_ceiling_rating: string;
    coating_rating: string;
    metal_rating: string;
    tile_cladding_rating: string;
    glass_cladding_rating: string;
    wooden_cladding_rating: string;
    railing_condition_rating: string;
    roofing_condition_rating: string;
    fence_condition_rating: string;
    gate_condition_rating: string;
    sanitary_condition_rating: string;
    pumping_condition_rating: string;
    ac_condition_rating: string;
    electrical_condition_rating: string;
    lift_condition_rating: string;
    external_areas_condition_rating: string;
    gardening_condition_rating: string;
    hard_landscape_condition_rating: string;
    escalator_condition_rating: string;
    photo: string;
    notes:String;
    estimated_maintenance_costs:String;
}

const schema = new Schema<IMyAssetModel>(
    {
        title: { type: String },
        category_id: { type: Schema.Types.ObjectId },
        user_id: { type: Schema.Types.ObjectId },
        asset_uses_id:{type: Schema.Types.ObjectId},
        structural_type_id: { type: Schema.Types.ObjectId },
        facade_type_data_id: { type: Schema.Types.ObjectId },
        description: { type: String },
        year_built: { type: String },
        gross_area: { type: String },
        build_area: { type: String },
        build_cost: { type: String },
        current_value: { type: String },
        current_issues: { type: String },
        Previous_issue: { type: String },
        is_active: { type: Boolean, default: true },
        general_rating: { type: String },
        structural_rating: { type: String },
        cleanliness_rating: { type: String },
        fitout_rating: { type: String },
        floors_rating: { type: String },
        doors_rating: { type: String },
        windows_rating: { type: String },
        wall_partitionin_rating: { type: String },
        secondary_ceiling_rating: { type: String },
        coating_rating: { type: String },
        metal_rating: { type: String },
        tile_cladding_rating: { type: String },
        glass_cladding_rating: { type: String },
        wooden_cladding_rating: { type: String },
        railing_condition_rating: { type: String },
        roofing_condition_rating: { type: String },
        fence_condition_rating: { type: String },
        gate_condition_rating: { type: String },
        sanitary_condition_rating: { type: String },
        pumping_condition_rating: { type: String },
        ac_condition_rating: { type: String },
        electrical_condition_rating: { type: String },
        lift_condition_rating: { type: String },
        external_areas_condition_rating: { type: String },
        gardening_condition_rating: { type: String },
        hard_landscape_condition_rating: { type: String },
        escalator_condition_rating: { type: String },
        photo: { type: String },
        notes:{type:String},
        estimated_maintenance_costs:{type:String}
    },
    {
        timestamps: true,
    }
);

const MyAssetModel = model("my_assets", schema);

export default MyAssetModel;
