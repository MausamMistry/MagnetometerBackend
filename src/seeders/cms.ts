'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import Cms from '../models/cms-model';
import mongoose from 'mongoose';

const SettingData = [
    // {
    //     key: 'INFO',
    //     value: '<p><span lang=\"EN\">Our online platform connects customers with registered and competent service providers who offer a wide range of maintenance services for homes, businesses, or other locations. Customers can post their maintenance problem and evaluate proposed solutions and quotes from service providers, selecting the one they prefer based on proposed solutions and ratings.</span></p>\n<p><span lang=\"EN\">We ensure that all our service providers are experienced and committed to delivering high-quality service, while monitoring customer feedback through a rating system. With our platform, finding and selecting a service provider is easy and stress-free, providing peace of mind for customers in need of maintenance services.&nbsp;</span></p>'
    // },
    {
        key: 'INFO',
        value: 'Our online platform connects customers with registered and competent service providers who offer a wide range of maintenance services for homes, businesses, or other locations. Customers can post their maintenance problem and evaluate proposed solutions and quotes from service providers, selecting the one they prefer based on proposed solutions and ratings.We ensure that all our service providers are experienced and committed to delivering high-quality service, while monitoring customer feedback through a rating system. With our platform, finding and selecting a service provider is easy and stress-free, providing peace of mind for customers in need of maintenance services.'
    },
    {
        key: 'SETTINGS',
        value: 'Our online platform connects customers with registered and competent service providers who offer a wide range of maintenance services for homes, businesses, or other locations. Customers can post their maintenance problem and evaluate proposed solutions and quotes from service providers, selecting the one they prefer based on proposed solutions and ratings.We ensure that all our service providers are experienced and committed to delivering high-quality service, while monitoring customer feedback through a rating system. With our platform, finding and selecting a service provider is easy and stress-free, providing peace of mind for customers in need of maintenance services.'
    },
    {
        key: 'CALIBRATION',
        value: 'Our online platform connects customers with registered and competent service providers who offer a wide range of maintenance services for homes, businesses, or other locations. Customers can post their maintenance problem and evaluate proposed solutions and quotes from service providers, selecting the one they prefer based on proposed solutions and ratings.We ensure that all our service providers are experienced and committed to delivering high-quality service, while monitoring customer feedback through a rating system. With our platform, finding and selecting a service provider is easy and stress-free, providing peace of mind for customers in need of maintenance services.'
    },
    {
        key: 'VIBRATION',
        value: 'Our online platform connects customers with registered and competent service providers who offer a wide range of maintenance services for homes, businesses, or other locations. Customers can post their maintenance problem and evaluate proposed solutions and quotes from service providers, selecting the one they prefer based on proposed solutions and ratings.We ensure that all our service providers are experienced and committed to delivering high-quality service, while monitoring customer feedback through a rating system. With our platform, finding and selecting a service provider is easy and stress-free, providing peace of mind for customers in need of maintenance services.'
    }
]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await Cms.deleteMany({});
        await Cms.create(SettingData);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
