'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import WhyMaintenance from '../models/why-maintenance-model';
import mongoose from 'mongoose';
const data = [
    {
        field_name: 'Free of Charge:',
        field_value: 'Accessing, subscribing to, and utilizing the Maintenance Master Platform is completely free of charge.',
        is_active: true,
        icon:"https://maintenancemasters.s3.amazonaws.com/why_maintenance_master/16835284559651.png",
    },
    {
        field_name: 'Systematic, Efficient, Simple and Integrated Process:',
        field_value: 'The MM Process is designed to allow customers to efficiently track and follow up on their service requests. The application offers digital forms that capture users needs, requests, and feedback.',
        is_active: true,
        icon:"https://maintenancemasters.s3.amazonaws.com/why_maintenance_master/16835285782742.png",
    },
    {
        field_name: 'Best price guaranteed:',
        field_value: 'The application enables multiple service providers to compete through a bidding process to offer their services for any service request posted by the customer. This ensures that the customer receives the best service in terms of price, quality, and time schedule',
        is_active: true,
        icon:"https://maintenancemasters.s3.amazonaws.com/why_maintenance_master/16835286554766.png",
    },
    {
        field_name: 'Successful Service Delivery:',
        field_value:'The application is designed to ensure the successful delivery of services that fully satisfy the customer.',
        is_active: true,
        icon:"https://maintenancemasters.s3.amazonaws.com/why_maintenance_master/16835286104283.png",
    },
    {
        field_name: 'Documentation and Asset Management:',
        field_value: 'The application maintains comprehensive documentation on customer maintenance requests and asset data, enabling them to manage their asset maintenance',
        is_active: true,
        icon:"https://maintenancemasters.s3.amazonaws.com/why_maintenance_master/16835286892864.png",
    },
    {
        field_name: 'Community Engagement:',
        field_value:'Maintenance Master engages customers in a community focused on asset maintenance and facility management to share stories and experiences in order to advance knowledge and expertise in this field',
        is_active: true,
        icon:"https://maintenancemasters.s3.amazonaws.com/why_maintenance_master/16835287155845.png"
    },
   
]

const seedDB = async () => {

    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await WhyMaintenance.deleteMany({});
        await WhyMaintenance.create(data);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
