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
import sensor from "./controllers/user/sensor";
const morgan = require("morgan");

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

app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));

app.use(cors(corsOptions)); // Use this after the variable declaration
// start route

app.get("/api/", function (req: any, res: any) {
    res.send("Hello World!123");
});
app.use("/api", indexRouter);

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
// cron.schedule("15 0 * * *", async () => {
//     await cronService.databaseBackup();
//     await cronService.autoCancelledAfter12Month();
//     await cronService.serviceAutoCancelAfter30Day();
// });

// cron.schedule("* * * * *", async () => {
//     // all monite after delete this 
//     await cronService.autoCancelledAfter12Month();
// });

// Cron job every night at midnight is a commonly used cron schedule.

// cron.schedule("0 0 * * *", async () => {
//     await cronService.serviceAutoClose();
//     await cronService.destroyToken(); // remove auto token 
//     console.log("Database device token  delete ");
//     console.log("Cron job every night at midnight is a commonly used cron schedule.  ");
// });

cron.schedule('0 0 * * SUN', async () => {
    // await cronService.serviceAutoCancelAfter30Day();
    await sensor.deleteSensorDataPassedDays();
    console.log('cronjob');
});

// cron.schedule("* * * * * *", async () => {
//     await cronService.randomDataUpdate();
// // update data here
// });
