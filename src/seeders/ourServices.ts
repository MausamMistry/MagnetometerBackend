'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import OurServices from '../models/our-services';
import mongoose from 'mongoose';

const data = [
    {
        name: 'A/C System',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/16728919673551.png',
        index:1,
        is_active: true,
    },
    {
        name: 'Electrical Services',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/16728920966172.png',
        index:2,
        is_active: true,
    },
    {
        name: 'Painting',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/16728924482403.png',
        index:3,
        is_active: true,
    },
    {
        name: 'Carpentry',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/16728924742434.png',
        index:4,
        is_active: true,
    },
    {
        name: 'Masonry Repair',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/16728925066195.png',
        index:5,
        is_active: true,
    },
    {
        name: 'Structural Repair',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/16728925330886.png',
        index:6,
        is_active: true,
    },
    {
        name: 'Plumbing',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/16728925569337.png',
        index:7,
        is_active: true,
    },
    {
        name: 'Drainage',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/16728925846028.png',
        index:8,
        is_active: true,
    },
    {
        name: 'Waterproofing',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/16728926171229.png',
        index:9,
        is_active: true,
    },
    {
        name: 'Roof Treatment',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167289264890510.png',
        index:10,
        is_active: true,
    },
    {
        name: 'Cleaning',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167289267461111.png',
        index:11,
        is_active: true
    },

    {
        name: 'Interior Fit out',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167289270763412.png',
        index:12,
        is_active: true,
    },
    {
        name: 'Smart Homes',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167289273200613.png',
        index:13,
        is_active: true,
    },
    {
        name: 'Overhauling',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167289276205514.png',
        index:14,
        is_active: true,
    },
    {
        name: 'Annual Contract',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167289278624615.png',
        index:15,
        is_active: true,
    },
    {
        name: 'Inspection',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167289281351016.png',
        index:16,
        is_active: true,
    },
    {
        name: 'Expert Opinion',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167289284149117.png',
        index:17,
        is_active: true,
    },
    {
        name: 'Asset Condition',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167290095793818.png',
        index:18,
        is_active: true,
    },
    {
        name: 'Investigation',
        img:'https://maintenancemasters.s3.amazonaws.com/admin/167290098303819.png',
        index:19,
        is_active: true,
    },
   

]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await OurServices.deleteMany({});
        await OurServices.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
