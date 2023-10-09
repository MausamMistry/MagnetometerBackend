'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import mongoose from 'mongoose';
import User from '../models/user-model';
import bcrypt from 'bcrypt';

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        const password = "1234567";
        const passwordhash: any = await bcrypt.hash(password, Number(10));
        // await User.deleteMany({});
        return await User.create([{
            first_name: 'Juhi',
            last_name: 'Kothwala',
            user_name: 'jk_kothwala',
            mobile_no: '7575030796',
            type: '1',
            email: 'customer@admin.com',
            password: passwordhash,
            location: '{\"address\":\"Surat, Gujarat, India\",\"latitude\":21.1702401,\"longitude\":21.1702401}',
            profile_photo: 'https://maintenancemasters.s3.amazonaws.com/admin/1672840141072download%20%286%29.jpg',
            is_active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }],
        );
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
