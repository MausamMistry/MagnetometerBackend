'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import SocialMedia from '../models/social-media-model';
import mongoose from 'mongoose';

const data = [
    {
        name: 'Intragram',
        value: 'https://www.instagram.com/maintenance.master.app/',
        icon: "https://maintenancemasters.s3.amazonaws.com/social_icon/1684819324304imgpsh_fullsize_anim%20%281%29.png",
        is_active: true,
    },
    {
        name: 'Facebook',
        value: 'https://www.facebook.com/MaintenanceMasterPlatfom',
        icon: "https://maintenancemasters.s3.amazonaws.com/social_icon/1683541207303facebook-3-xxl.png",
        is_active: true,
    },
    {
        name: 'Linkedin',
        icon: 'https://maintenancemasters.s3.amazonaws.com/social_icon/1683541185734linkedin-3-xxl.png',
        value: "https://www.linkedin.com/in/maintenance-master-805b75262/",
        is_active: true,
    },
   
]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await SocialMedia.deleteMany({});
        await SocialMedia.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
