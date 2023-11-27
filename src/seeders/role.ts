'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import mongoose from 'mongoose';
import Permissions from '../models/permission-model';
import Role from '../models/role-model';


const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        var Permissions_data = await Permissions.find();
        
        var perArray: any = new Array();
        var subPerArray: any = new Array();
        Permissions_data.forEach((element: any) => {
            perArray.push(element.name)
            if(element.name == "subadmin_view" || element.name == "notification") {
                subPerArray.push(element.name)
            }
        });

        var roleArray = [
            {
                name: 'super_admin',
                permission_name: JSON.stringify(perArray),
                guard_name: 'admins',
                createdAt: new Date(),
                updated_at: new Date(),
            },
            {
                name: 'admin',
                permission_name: JSON.stringify(subPerArray),
                guard_name: 'sub_admins',
                createdAt: new Date(),
                updated_at: new Date(),
            }
        ]

        await Role.deleteMany({});
        await Role.create(roleArray);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
