'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import CategoriesDispute from "../models/categories-dispute-model";
import mongoose from 'mongoose';


const data = [
    {
        name: 'Poor Vendor Performance',
        is_active: true,
    },
    {
        name: 'Poor Quality of Materials',
        is_active: true,
    },
    {
        name: 'Poor Workmanship/Installation',
        is_active: true,
    },
    {
        name: 'Delay',
        is_active: true,
    },
    {
        name: 'Process Efficiency',
        is_active: true,
    },
    {
        name: 'Payment Issue',
        is_active: true,
    },
    {
        name: 'Accident/Incident Report',
        is_active: true,
    },
    {
        name: 'Misbehaviour, Abuse, Fraud, Criminal Act',
        is_active: true,
    },
    {
        name: 'Others',
        is_active: true,
    },
]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await CategoriesDispute.deleteMany({});
        await CategoriesDispute.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
