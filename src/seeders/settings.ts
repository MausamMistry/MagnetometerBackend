'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import Setting from '../models/setting-model';
import mongoose from 'mongoose';

const SettingData = [
    {
        setting_name: 'name',
        setting_value: ' App'
    },
    {
        setting_name: 'email',
        setting_value: 'juhi.modi@gmail.com'
    },
    {
        setting_name: 'phone_number',
        setting_value: '7575030796'
    },
    {
        setting_name: 'db_backup_email_id',
        setting_value: 'admin@admin.com'
    },
    {
        setting_name: 'logo',
        setting_value: ''
    },
    {
        setting_name: 'contact_us',
        setting_value: '7575030796'
    },
    {
        setting_name: 'customer_footer_about_us',
        setting_value: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s '
    },
    {
        setting_name: 'instagram_url',
        setting_value: 'instagram.com'
    },
    {
        setting_name: 'facebook_url',
        setting_value: 'facebook.com'
    },
    {
        setting_name: 'twitter_url',
        setting_value: 'twitter.com'
    },
    {
        setting_name: 'whatsapp_url',
        setting_value: 'whatsapp_url.com'
    },
    {
        setting_name: 'youtube_url',
        setting_value: 'youtube.com'
    },
    {
        setting_name: 'site_address',
        setting_value: 'surat '
    },
]

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await Setting.deleteMany({});
        await Setting.create(SettingData);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
