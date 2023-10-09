'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import Priority from '../models/priority-model';
import mongoose from 'mongoose';

const data = [
    {
        name: 'Low',
        is_active: true,
    },
    {
        name: 'Medium',
        is_active: true,
    },
    {
        name: 'Urgent',
        is_active: true,
    },
]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await Priority.deleteMany({});
        await Priority.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
