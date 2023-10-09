'use strict';
require('dotenv').config({ path: 'D:/oct/Magnetometer App/Magnetometer-Backend' + '/.env' })
import ServiceType from '../models/service-type-model';
import mongoose from 'mongoose';

const data = [
    {
        name: 'Architectural',
        is_active: true,
    },

    {
        name: 'Interior fit-out',
        is_active: true,
    },

    {
        name: 'Painting',
        is_active: true,
    },

    {
        name: 'Flooring',
        is_active: true,
    },

    {
        name: 'Carpentry',
        is_active: true,
    },

    {
        name: 'Masonry Repair',
        is_active: true,
    },

    {
        name: 'Waterproofing/Leakage Repair',
        is_active: true,
    },

    {
        name: 'Roof Treatment',
        is_active: true,
    },

    {
        name: 'Structural Repair',
        is_active: true,
    },

    {
        name: 'A/C System',
        is_active: true,
    },

    {
        name: 'Electrical Services',
        is_active: true,
    },

    {
        name: 'Plumping',
        is_active: true,
    },

    {
        name: 'Drainage',
        is_active: true,
    },
    {
        name: 'Smart Homes',
        is_active: true,
    },
    {
        name: 'Overhauling',
        is_active: true,
    },
    {
        name: 'Inspection',
        is_active: true,
    },
    {
        name: 'Issue Investigation',
        is_active: true,
    },
    {
        name: 'Expert Opinion',
        is_active: true,
    },
    {
        name: 'Cleaning/Washing',
        is_active: true,
    },
    {
        name: 'Asset Condition Assessment',
        is_active: true,
    },
    {
        name: 'Annual Contract',
        is_active: true,
    },
    {
        name: 'plumbing',
        is_active: true,
    },
    {
        name: 'Not Applicable',
        is_active: true,
    },
    {
        name: 'N/A',
        is_active: true,
    },
    {
        name: 'Multiple Services/Different Disciplines',
        is_active: true,
    },
]


const sTdata = [
    {

        "name": "Interior fit-out",
        "is_active": true,
        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Interior fit out </span></strong><span lang=\"EN\">- Skilled experts will design and install customized interior features to meet your specific needs and style preferences, ensuring that your space is both functional and aesthetically pleasing.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/167808438020012.png"
    },
    {

        "name": "Carpentry",
        "is_active": true,
        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Carpentry</span></strong><span lang=\"EN\"> - Experienced carpenters specialize in the construction, repair, and installation of a wide range of wooden structures and furnishings, using the highest quality materials and techniques to ensure lasting durability and beauty.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16780844135274.png"
    },
    {

        "name": "Masonry Repair",
        "is_active": true,
        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Masonry repair </span></strong><span lang=\"EN\">- Skilled masons will expertly restore and repair brick, stone, and concrete structures to their original condition, preventing further damage and ensuring the safety and longevity of your building.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16780840906655.png"
    },
    {

        "name": "Waterproofing",
        "is_active": true,
        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Waterproofing</span></strong><span lang=\"EN\"> - Professionals will provide waterproofing services to help protect your building from water damage by applying high-quality materials and techniques to prevent water from penetrating surfaces and structures.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16780841323309.png"
    },
    {

        "name": "Roof Treatment",
        "is_active": true,
        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Roof treatment</span></strong><span lang=\"EN\"> - A team of roofing experts will provide comprehensive cleaning, maintenance, and repair services to ensure that your roof is in top condition, protecting your building from leaks and other damage.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/167808418189210.png"
    },
    {

        "name": "Structural Repair",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\">Structural repair</span></strong><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\"> - Experts in structural repair services are available to reinforce and repair building structures, ensuring safety and stability for occupants and preventing further damage.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16780842289176.png"
    },
    {

        "name": "A/C System",
        "is_active": true,
        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">A/C system</span></strong><span lang=\"EN\"> - Skilled technicians specialize in the installation, maintenance, and repair of air conditioning systems, ensuring optimal performance and energy efficiency to keep your space cool and comfortable.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16780842492291.png"
    },
    {

        "name": "Electrical Services",
        "is_active": true,
        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Electrical services</span></strong><span lang=\"EN\"> - Certified electricians offer a wide range of services, including installation, maintenance, and repair of electrical systems and equipment, ensuring safety and reliability for your building.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16780843424282.png"
    },
    {

        "name": "Drainage",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Drainage</span></strong><span lang=\"EN\"> - Professionals will provide installation and repair of drainage systems, ensuring proper management of water flow and preventing damage to your building and surrounding areas.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16780836501708.png"
    },
    {

        "name": "Plumbing",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Plumbing</span></strong><span lang=\"EN\"> &ndash; Highly skilled and well-trained professionals in plumbing services involve installation and fixing the piping systems using state-of-the-art equipment, ensuring efficient and effective solutions<s>.</s></span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16780837552407.png"
    },
    {

        "name": "Painting",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Painting</span></strong><span lang=\"EN\"> - Skilled painters offer a range of painting services, including interior and exterior painting, to protect and enhance the appearance of your building.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16780844353023.png"
    },

    {

        "name": "Issue Investigation",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Issue investigation</span></strong><span lang=\"EN\"> - A team of experts will identify and diagnose issues with your assets, buildings or systems, providing recommendations for repair and maintenance to ensure long-term durability and performance.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/167808480444119.png"
    },
    {

        "name": "Inspection",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; color: black; mso-themecolor: text1; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\">Inspection</span></strong><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; color: black; mso-themecolor: text1; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\"> -<span style=\"color: rgb(52, 73, 94);\"> Comprehensive inspection services </span></span><span style=\"color: rgb(52, 73, 94);\"><span lang=\"EN\" style=\"font-size: 11pt; line-height: 115%; font-family: Arial, sans-serif;\">to assess </span><span lang=\"EN\" style=\"font-size: 11pt; line-height: 115%; font-family: Arial, sans-serif;\">the condition </span><span lang=\"EN\" style=\"font-size: 11pt; line-height: 115%; font-family: Arial, sans-serif;\">and integrity of </span><span lang=\"EN\" style=\"font-size: 11pt; line-height: 115%; font-family: Arial, sans-serif;\">your building and systems, identifying </span><span lang=\"EN\" style=\"font-size: 11pt; line-height: 115%; font-family: Arial, sans-serif;\">risks and issues,</span><span lang=\"EN\" style=\"font-size: 11pt; line-height: 115%; font-family: Arial, sans-serif;\"> and providing recommendations for maintenance </span><span lang=\"EN\" style=\"font-size: 11pt; line-height: 115%; font-family: Arial, sans-serif;\">plans</span><span lang=\"EN\" style=\"font-size: 11pt; line-height: 115%; font-family: Arial, sans-serif;\">, repairs </span><span lang=\"EN\" style=\"font-size: 11pt; line-height: 115%; font-family: Arial, sans-serif;\">and solutions</span></span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/167808382033516.png"
    },
    {

        "name": "Expert Opinion",
        "is_active": true,

        "description": "<p><span style=\"color: rgb(0, 0, 0);\"><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Expert Opinion</span></strong></span><span lang=\"EN\"><span style=\"color: rgb(0, 0, 0);\"> - A team of experts offers consultation and advice on a wide range of building and maintenance topics, providing the information you need to make informed decisions about your building. Our services include assessment of the implemented maintenance regime, durability analysis of the reinforced concrete structures, estimating the structure deterioration rate and its residual life. <span style=\"mso-spacerun: yes;\">&nbsp;</span></span><span style=\"mso-spacerun: yes;\">&nbsp;</span></span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/167808384041117.png"
    },
    {

        "name": "Cleaning",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Cleaning</span></strong><span lang=\"EN\"> - Cleaning services include regular cleaning of buildings, surfaces, and systems, ensuring a clean and healthy environment for occupants.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/1678084655345167600466408811.png"
    },
    {

        "name": "Annual Contract",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\">Annual Contract</span></strong><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\"> - Annual contract services provide<span style=\"color: rgb(0, 0, 0);\"> periodic mainte</span>nance and support to ensure the ongoing health and performance of your building and systems.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/167842344046715%20%282%29.png"
    },
    {
        "name": "Home appliances",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\">Home Appliances</span></strong><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\"> - Technicians specialize in the installation and repair of a wide range of household appliances, ensuring optimal performance and longevity.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/1678424935328home-appliances.png"
    },
    {

        "name": "Asset Condition",
        "is_active": true,

        "description": "<p><span style=\"color: rgb(0, 0, 0);\"><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\">Asset Condition</span></strong><span lang=\"EN\"> &ndash; Our services provide a comprehensive evaluation and assessment of the condition of your building and assets, identifying risks and potential issues, and providing recommendations for maintenance plans and repair. Our services include durability analysis of the reinforced concrete structures, estimating the structure deterioration rate and its residual life.</span></span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/167808398091318.png"
    },
    {

        "name": "Smart Homes",
        "is_active": true,

        "description": "<p><strong style=\"mso-bidi-font-weight: normal;\"><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\">Smart homes</span></strong><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\"> - Smart home services involve the installation and maintenance of home automation systems, providing convenience, comfort, and energy efficiency for occupants.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/167808402495613.png"
    },
    {

        "name": "Overhauling",
        "is_active": true,

        "description": "<p><span lang=\"EN\" style=\"font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif; mso-fareast-font-family: Arial; mso-ansi-language: EN; mso-fareast-language: EN-US; mso-bidi-language: AR-SA;\"><strong>Overhauling Services</strong> provide comprehensive repair, maintenance, and refurbishment of systems and structures, ensuring optimal performance and longevity.</span></p>",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/167808461043414.png"
    },
    // {

    //     "is_active": true,
    //     "name": "Multiple Services/Different Disciplines",
    //     "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/1683526882231167808402495613.png",
    //     "description": "<p>Multiple Services/Different<br>Disciplines</p>",

    // },
    {

        "is_active": true,
        "name": "N/A",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/1687861875303NA.png",
        "description": "<p>- N/A</p>",

    },
    {

        "is_active": false,
        "name": "Plumping",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/1683526983996167808402495613.png",
        "description": "<div>\n<div>Plumping</div>\n</div>",

    },
    {

        "is_active": false,
        "name": "Multiple Services/Different Disciplines",
        "icon": "https://maintenancemasters.s3.amazonaws.com/service_type/16884466947901687850346345multi-services.png",
        "description": "<div>\n<div>Plumping</div>\n</div>",

    },
]


const seedDB = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        await ServiceType.deleteMany({});
        await ServiceType.create(sTdata);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
