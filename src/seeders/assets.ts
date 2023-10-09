'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import Assets from '../models/asset-model';

import mongoose from 'mongoose';


const data = [
    {
        name: 'Villa/Townhouse',
        is_active: true,
    },
    {
        name: 'Apartment',
        is_active: true,
    },
    {
        name: 'Building',
        is_active: true,
    },
    {
        name: 'Tower/High Rise Building',
        is_active: true,
    },
    {
        name: 'Warehouse, Industrial Facility',
        is_active: true,
    },
    {
        name: 'Infrastructure',
        is_active: true,
    },
    {
        name: 'General Facility',
        is_active: true,
    },
    {
        name: 'Portable/Temporary building, Kiosk, Caravan, Tent',
        is_active: true,
    },
    {
        name: 'Yard, Park, Farm',
        is_active: true,
    },
    {
        name: 'Shop',
        is_active: true,
    },
    {
        name: 'Office',
        is_active: true,
    },
    {
        name: 'Hotel',
        is_active: true,
    },
    {
        name: 'Hospital',
        is_active: true,
    },
    {
        name: 'Store',
        is_active: true,
    },
    {
        name: 'Mall',
        is_active: true,
    },
    {
        name: 'Shopping Center',
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
        await Assets.deleteMany({});
        await Assets.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

