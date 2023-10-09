'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import AssetsStructureType from '../models/assets-structure-type-model';
import mongoose from 'mongoose';


const data = [
    {
        name: 'Concrete',
        is_active: true,
    },
    {
        name: 'Steel',
        is_active: true,
    },
    {
        name: 'Steel and Concrete',
        is_active: true,
    },
]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await AssetsStructureType.deleteMany({});
        await AssetsStructureType.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
