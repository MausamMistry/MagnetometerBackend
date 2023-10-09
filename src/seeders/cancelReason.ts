'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import cancelReason from '../models/cancel-reason-model';
import mongoose from 'mongoose';

const data = [
    {
        reson: 'High Prices',
        is_active: true,
    },
    {
        reson: 'Rescheduling the Maintenance',
        is_active: true,
    },
    {
        reson: 'Delay in receiving bids',
        is_active: true,
    },
    {
        reson: 'No bids were received',
        is_active: true,
    },
    {
        reson: 'I am using another platform',
        is_active: true,
    },
    {
        reson: 'I hired others to deliver the service to me',
        is_active: true,
    },
    {
        reson: 'I have changed my mind',
        is_active: true,
    },
    {
        reson: 'Others',
        is_active: true,
    },
]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await cancelReason.deleteMany({});
        await cancelReason.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
