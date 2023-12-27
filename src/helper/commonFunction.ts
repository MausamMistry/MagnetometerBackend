import log4js from "log4js";
// import mongoose from "mongoose";
const logger = log4js.getLogger();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');
// const path = require('path');


const sendEmail = ((msg: any) => {
    logger.info("msg");
    logger.info(msg);
    logger.info(sgMail);
    sgMail
        .send(msg)
        .then((response: any) => {
            logger.info("sendEmail");
            logger.info(response);
        })
        .catch((error: any) => {
            logger.info("sendEmail");
            logger.info(error);
        })
    return true
});

const sendEmailTemplate = (async (data: any) => {    
    try {

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587, // 465,
            secure: false, // true, // true for 465, false for other ports
            auth: {
                user: 'sarmistha.ebiztrait@gmail.com', // process.env.SENDER,
                pass: 'wwhqfasjbpghdajk' // process.env.PASS_KEY   //app password for gmail
            }
        });

        const pathUrl = process.env.APP_BASE_EMAIL_TEMP;

        console.log('pathUrl', pathUrl);
        
        // logger.info(process.env.SENDGRID_API_KEY)
        logger.info(pathUrl)
        const handlebarOptions = {
            viewEngine: {
                partialsDir: pathUrl,
                defaultLayout: false,
            },
            viewPath: pathUrl,
        };

        // use a template file with nodemailer
        transporter.use('compile', hbs(handlebarOptions))

        const pathImg = pathUrl + `logo.png`;

        let attech = [{
            filename: 'logo.png',
            path: pathImg,
            cid: 'logo1' //same cid value as in the html img src
        }]

        if (data.attachments) {
            attech = [...attech, data.attachments]
        }
        var mailOptions = {
            from: 'sarmistha.ebiztrait@gmail.com', // process.env.SENDER, // sender address
            to: data.to, // list of receivers
            subject: data.subject,
            template: data.template, // the name of the template file i.e email.handlebars
            context: data.sendEmailTemplatedata,
            attachments: attech
        };
        // trigger the sending of the E-mail
        await transporter.sendMail(mailOptions, function (error: any, info: any) {
            if (error) {
                console.log('error', error);
                
                logger.info(error)
                return true;
            }
            console.log('Message sent: ' + info.response);
        });
    } catch (err: any) {
        logger.info("sendEmailTemplate");
        logger.info(err);
        return
    }

});


const makeIdString = ((length: any) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
});
const stripePaymentIntentStatus = ((status: any) => {
    var result: Number = 0;

    if (status === 'amount_capturable_updated') {
        result = 1;
    }
    if (status === 'canceled') {
        result = 2;
    }
    if (status === 'created') {
        result = 3;
    }
    if (status === 'partially_funded') {
        result = 4;
    }
    if (status === 'payment_failed') {
        result = 5;
    }
    if (status === 'processing') {
        result = 6;
    }
    if (status === 'requires_action') {
        result = 7;
    }
    if (status === 'succeeded') {
        result = 8;
    }
    return result;
});


const generateOtp = (() => {
    logger.info("generateOtp");
    return Math.floor(1000 + Math.random() * 9000);
});

const smsGatway = (async (to: any, message: any) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);

        const data = await client.messages
            .create({
                body: message,
                from: 'MGdb42291fc9749ed57ddcc8140d4cb4f7',
                to: to
            })
            .then((message: any) => {
                logger.info("smsGatway")
                logger.info(message.sid)
            });
        return data;
    } catch (err: any) {
        logger.info(" smsGatway Issue ");
        logger.info(err);
        logger.info(err);
        return false
    }
});


const titleToSlug = (title: any) => {
    let slug;

    // convert to lower case
    slug = title.toLowerCase();

    // remove special characters
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    // The /gi modifier is used to do a case insensitive search of all occurrences of a regular expression in a string

    // replace spaces with dash symbols
    slug = slug.replace(/ /gi, "-");

    // remove consecutive dash symbols 
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');

    // remove the unwanted dash symbols at the beginning and the end of the slug
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug;
};


const isActive = () => {
    return { $match: { is_active: true } }
}

const srGetData = () => {
    let data = [
        {
            $lookup: {
                from: "service_types",
                localField: "service_type_id",
                foreignField: "_id",
                as: "serviceTypeData",
            },
        },
        {
            $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "userData",
            },
        },
        { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "assets",
                localField: "assets_id",
                foreignField: "_id",
                as: "assetsFacilityTypesData",
            },
        },
        { $unwind: { path: "$assetsFacilityTypesData", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "bids",
                localField: "selected_bid_id",
                foreignField: "_id",
                as: "srBidsData",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "vendor_id",
                            foreignField: "_id",
                            as: "workingSPData",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "user_tokes",
                                        localField: "_id",
                                        foreignField: "user_id",
                                        as: "userToken",
                                    },
                                },
                                {
                                    $unwind: {
                                        path: "$userToken",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: "$workingSPData",
                            preserveNullAndEmptyArrays: true,
                        },
                    },

                ],
            },
        },
        { $unwind: { path: "$srBidsData", preserveNullAndEmptyArrays: true } },

    ]
    return data
}
const srSlugGetData = () => {
    let data = [
        {
            $lookup: {
                from: "priorities",
                localField: "priority",
                foreignField: "_id",
                as: "priorityData",
            },
        },
        {
            $unwind: { path: "$priorityData", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup:
            {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'userData'
            }
        },
        { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "service_request_files",
                localField: "_id",
                foreignField: "service_request_id",
                pipeline: [
                    {
                        $match: {
                            type: "1"
                        }
                    },
                ],
                as: "serviceRequestImagesData",
            },
        },
        {
            $lookup: {
                from: "service_request_files",
                localField: "_id",
                foreignField: "service_request_id",
                pipeline: [
                    {
                        $match: {
                            type: "2"
                        }
                    },
                ],
                as: "serviceRequestDocumentData",
            },
        },
        {
            $lookup:
            {
                from: 'service_types',
                localField: 'service_type_id',
                foreignField: '_id',
                as: 'serviceTypeData'
            }
        },
        { $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "assets",
                localField: "assets_id",
                foreignField: "_id",
                as: "assetsFacilityTypesData",
            },
        },
        { $unwind: { path: "$assetsFacilityTypesData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "bids",
                localField: "selected_bid_id",
                foreignField: "_id",
                as: "srBidsData",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "vendor_id",
                            foreignField: "_id",
                            as: "workingSPData",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "user_tokes",
                                        localField: "_id",
                                        foreignField: "user_id",
                                        as: "userToken",
                                    },
                                },
                                {
                                    $unwind: {
                                        path: "$userToken",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: {
                            path: "$workingSPData",
                            preserveNullAndEmptyArrays: true,
                        },
                    },

                ],
            },
        },
        { $unwind: { path: "$srBidsData", preserveNullAndEmptyArrays: true } },

        // {
        //     $lookup: {
        //         from: "bids",
        //         localField: "_id",
        //         foreignField: "service_request_id",
        //         as: "bidsData",
        //         pipeline: [
        //             // isActive(),
        //             {
        //                 $lookup: {
        //                     from: "users",
        //                     localField: "vendor_id",
        //                     foreignField: "_id",
        //                     as: "serviceProvider",
        //                     pipeline: [
        //                         {
        //                             $lookup: {
        //                                 from: "user_tokes",
        //                                 localField: "_id",
        //                                 foreignField: "user_id",
        //                                 as: "deviceToken",
        //                             },
        //                         },
        //                     ]
        //                 },
        //             },
        //             {
        //                 $unwind: {
        //                     path: "$serviceProvider",
        //                     preserveNullAndEmptyArrays: true,

        //                 },
        //             },

        //         ],
        //     },
        // },
        // { $unwind: { path: "$bidsData", preserveNullAndEmptyArrays: true } },
        {
            $lookup:
            {
                from: 'complishment_reports',
                localField: '_id',
                foreignField: 'service_request_id',
                as: 'complishmentReportData'
            }
        },
        // { $unwind: { path: "$complishmentReportData", preserveNullAndEmptyArrays: true } },


    ]
    return data
}

const srSlugReportData = () => {
    let data = [
        {
            $lookup: {
                from: "priorities",
                localField: "priority",
                foreignField: "_id",
                as: "priorityData",
            },
        },
        {
            $unwind: { path: "$priorityData", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup:
            {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'userData'
            }
        },
        { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "service_request_files",
                localField: "_id",
                foreignField: "service_request_id",
                pipeline: [
                    {
                        $match: {
                            type: "1"
                        }
                    },
                ],
                as: "serviceRequestImagesData",
            },
        },
        {
            $lookup: {
                from: "service_request_files",
                localField: "_id",
                foreignField: "service_request_id",
                pipeline: [
                    {
                        $match: {
                            type: "2"
                        }
                    },
                ],
                as: "serviceRequestDocumentData",
            },
        },
        {
            $lookup:
            {
                from: 'service_types',
                localField: 'service_type_id',
                foreignField: '_id',
                as: 'serviceTypeData'
            }
        },
        { $unwind: { path: "$serviceTypeData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "assets",
                localField: "assets_id",
                foreignField: "_id",
                as: "assetsFacilityTypesData",
            },
        },
        { $unwind: { path: "$assetsFacilityTypesData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "bids",
                localField: "selected_bid_id",
                foreignField: "_id",
                as: "srBidsData",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "vendor_id",
                            foreignField: "_id",
                            as: "workingSPData",
                        },
                    },
                    {
                        $unwind: {
                            path: "$workingSPData",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                ],
            },
        },
        { $unwind: { path: "$srBidsData", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "bids",
                localField: "_id",
                foreignField: "service_request_id",
                as: "bidsData",
                pipeline: [
                    // isActive(),
                    {
                        $lookup: {
                            from: "users",
                            localField: "vendor_id",
                            foreignField: "_id",
                            as: "serviceProvider",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "user_tokes",
                                        localField: "_id",
                                        foreignField: "user_id",
                                        as: "deviceToken",
                                    },
                                },
                            ]
                        },
                    },
                    {
                        $unwind: {
                            path: "$serviceProvider",
                            preserveNullAndEmptyArrays: true,

                        },
                    },
                    {
                        $lookup: {
                            from: "cancel_reasons",
                            localField: "reject_reason_id",
                            foreignField: "_id",
                            as: "rejectedBidData",
                        },
                    },
                    {
                        $unwind: {
                            path: "$rejectedBidData",
                            preserveNullAndEmptyArrays: true,
                        },
                    },

                    {
                        $lookup: {
                            from: "reviews",
                            localField: "_id",
                            foreignField: "bid_id",
                            as: "srReviewData",
                        },
                    },
                    {
                        $unwind: {
                            path: "$srReviewData",
                            preserveNullAndEmptyArrays: true,
                        },
                    },


                ],
            },
        },
        // { $unwind: { path: "$bidsData", preserveNullAndEmptyArrays: true } },
        {
            $lookup:
            {
                from: 'complishment_reports',
                localField: '_id',
                foreignField: 'service_request_id',
                as: 'complishmentReportData'
            }
        },
        // { $unwind: { path: "$complishmentReportData", preserveNullAndEmptyArrays: true } },
    ]
    return data
}

const checkSpecialChr = async (filter: any) => {

    const pattern = /^[^*\?]*$/;
    const testFilter = pattern.test(filter);

    let filterTextValue: any = testFilter ? filter : '';
    return filterTextValue;
}


export default {
    sendEmailTemplate,
    generateOtp,
    smsGatway,
    makeIdString,
    sendEmail,
    titleToSlug,
    isActive,
    stripePaymentIntentStatus,
    srGetData,
    srSlugGetData,
    srSlugReportData,
    checkSpecialChr
}