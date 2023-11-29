import { Router } from "express";
import decMiddleware from "../helper/decryptData";
import customerValidation from "../validation/user/auth-validation";
import commonValidation from "../validation/common-validation";
import settingService from "../controllers/admin/setting";
import authAdminService from "../controllers/admin/auth";
import authCustomerService from "../controllers/user/auth";
import commonService from "../controllers/common/common";
import authValidation from "../validation/admin/auth-validation"
import userAuthValidation from "../validation/user/auth-validation"
import contactValidation from '../validation/user/contactUs-validation'
import suggestionValidation from "../validation/user/suggestion-validation";
import serviceRequestValidation from "../validation/user/serviceRequest-validation";
import serviceRequestService from "../controllers/user/serviceRequest";
import trainingMaterialService from "../controllers/user/trainingMaterial";
import sensorReqService from "../controllers/user/sensor";

// Constants
const noAuthRouter = Router();
noAuthRouter.use(decMiddleware.DecryptedData);

noAuthRouter.post("/admin/login", authValidation.login, authAdminService.login);
noAuthRouter.post("/admin/forget-password", authValidation.emailValidation, authAdminService.forgetPassword);
noAuthRouter.post("/admin/reset-password", authValidation.resetPassword, authAdminService.resetPassword);

// Customer NOAuth Route Start
noAuthRouter.post("/user/login", customerValidation.login, authCustomerService.login);
noAuthRouter.post("/user/register", customerValidation.register, authCustomerService.register);
// noAuthRouter.post("/user/register",authCustomerService.register);
noAuthRouter.post("/user/forget-password", userAuthValidation.emailValidation, authCustomerService.forgetPassword);
noAuthRouter.post("/user/reset-password", userAuthValidation.resetPassword, authCustomerService.resetPassword);

noAuthRouter.post("/user/verify-phone", userAuthValidation.verifyMobileNumber, authCustomerService.mobileVerification);
// Common
noAuthRouter.get("/setting/get", settingService.get);
noAuthRouter.post("/verify-otp", userAuthValidation.verifyOtp, commonService.otpVerification);
noAuthRouter.post("/chat-store", commonValidation.storeChat, commonService.storeChat);
noAuthRouter.post("/chat-get", commonService.getChat);
noAuthRouter.get("/get-our-services", commonService.getOurServices);
noAuthRouter.get("/faq-get", commonService.getFaq);

noAuthRouter.post("/post-get", commonService.getPost);
noAuthRouter.post("/post-detail", commonService.getPostDetail);
noAuthRouter.get("/post/check-islike", commonService.getCheckIsLikePost)
noAuthRouter.post("/post-store", commonService.storePost);
noAuthRouter.post("/contact-us", contactValidation.store, commonService.storeContactUs);
noAuthRouter.post("/suggestion", suggestionValidation.store, commonService.storeSuggestion);
noAuthRouter.get("/cms", commonService.getCms);
noAuthRouter.post("/mobile-post-get",commonService.getPostMobile)


noAuthRouter.get("/service-request-report", serviceRequestValidation.getBySlug, serviceRequestService.getReport);

//email checking api 
noAuthRouter.post("/check-field", commonValidation.fieldExistValidation, commonService.checkDataField);

noAuthRouter.get("/training-material/get", trainingMaterialService.get);


// sensor api
noAuthRouter.post('/add-sensor-data', sensorReqService.store);
noAuthRouter.post('/get-sensor', sensorReqService.getSensorData);


// Export default
export default noAuthRouter;
