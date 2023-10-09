'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import OurContactUs from '../models/our-contact-us-model';
import mongoose from 'mongoose';

const contactUsData = [
    {
        key: 'email',
        value: 'maintenance.master.user@gmail.com'
    },
    {
        key: 'contact_no',
        value: '+971501116173'
    },
    {
        key: 'location',
        value: '{"address":"101, Causeway Rd, River Park Society, Singanpor, Surat, Gujarat 395004, India","latitude":21.224911,"longitude":72.8073869}'
    },
    {
        key: 'website',
        value: 'http://34.235.150.200/home'
    },
    {
        key: 'admin_email',
        value: 'maintance.master.app@gmail.com'
    },
]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await OurContactUs.deleteMany({});
        await OurContactUs.create(contactUsData);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
