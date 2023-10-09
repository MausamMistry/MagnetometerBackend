'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import AssetsFacadeType from '../models/assets-facade-type-model';
import mongoose from 'mongoose';


const data = [
    {
        name: 'Glass',
        is_active: true,
    },
    {
        name: 'Aluminum',
        is_active: true,
    },
    {
        name: 'Coated Concrete/Block',
        is_active: true,
    },
    {
        name: 'Stone',
        is_active: true,
    },
    {
        name: 'N/A',
        is_active: true,
    },
]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await AssetsFacadeType.deleteMany({});
        await AssetsFacadeType.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
