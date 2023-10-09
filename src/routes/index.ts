import { Router } from "express";
import commonRouter from "./common-router";
import userRouter from "./user-router";
import adminRouter from "./admin-router";
import noAuthRouter from "./no-auth-router";
import commonService from '../controllers/common/common';
import multer from 'multer';

// Export the base-router
const baseRouter = Router();
// Setup routers

const upload = multer({ dest: "uploads/" });

baseRouter.post('/common/upload_image_multi', upload.array('files'), [commonService.uploadImageMulti]);
baseRouter.post('/common/upload_image', upload.array('files'), [commonService.uploadImage]);
baseRouter.post('/common/upload_video', upload.array('files'), [commonService.uploadVideo]);
baseRouter.post('/common/upload_file', upload.array('files'), [commonService.uploadFiles]);
baseRouter.use('/', noAuthRouter);
baseRouter.use('/common', commonRouter);
baseRouter.use('/user', userRouter);
baseRouter.use('/admin', adminRouter);

// Export default.
export default baseRouter;
