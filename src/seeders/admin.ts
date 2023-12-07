'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import mongoose from 'mongoose';
import Admin from '../models/admin-model';
import Role from '../models/role-model';
import bcrypt from 'bcrypt';

const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        var roleData: any = await Role.findOne({ 'name': 'super_admin' });
        const password = "admin@123";
        const passwordhash: any = await bcrypt.hash(password,Number(10));

        await Admin.deleteMany({});
        return await Admin.create([{
            first_name: 'Admin',
            last_name: 'Admin',
            email: 'admin@admin.com',
            role_id: roleData._id,
            is_admin: 'admin',
            mobile_no: '2345678912',
            password: passwordhash,
            is_superadmin: 'yes',
            is_active: true,
            createdAt: new Date(),
            updated_at: new Date(),
        },
        {
            first_name: 'juhi',
            last_name: 'modi',
            email: 'juhi@admin.com',
            is_admin: 'admin',
            mobile_no: '3451234567',
            role_id: roleData._id,
            password: passwordhash,
            is_superadmin: 'yes',
            is_active: true,
            createdAt: new Date(),
            updated_at: new Date(),
        }],
        );
    }
    return
}

seedDB().then(() => {
    mongoose.connection.close();
})
