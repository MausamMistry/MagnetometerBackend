'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import AssetsUses from '../models/assets-uses-model';
import mongoose from 'mongoose';


const data = [
    {
        name: 'Residential',
        is_active: true,
    },
    {
        name: 'Offices',
        is_active: true,
    },
    {
        name: 'Hotel',
        is_active: true,
    },
    {
        name: 'Shopping Center, Mall, Exhibition',
        is_active: true,
    },
    {
        name: 'Retail Shop, Café, Restaurant, Club',
        is_active: true,
    },
    {
        name: 'Hospital, Medical Center, Clinic',
        is_active: true,
    },
    {
        name: 'Industrial, Factory, Garage, Laboratory',
        is_active: true,
    },
    {
        name: 'Store, Library',
        is_active: true,
    },
    {
        name: 'Car Park',
        is_active: true,
    },
    {
        name: 'University, Institute, School, Training Center',
        is_active: true,
    },

    {
        name: 'Sport Facility',
        is_active: true,
    },

    {
        name: 'Other',
        is_active: true,
    },




]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await AssetsUses.deleteMany({});
        await AssetsUses.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
