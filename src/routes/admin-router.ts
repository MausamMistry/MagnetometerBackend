import { Router } from "express";

import { authAdmin } from "../middleware/admin-guard";
import decMiddleware from "../helper/decryptData";

import authService from "../controllers/admin/auth";
import commonValidation from "../validation/common-validation";

import categoryService from "../controllers/admin/category";
import categoryValidation from "../validation/admin/category-validation";

import userService from "../controllers/admin/user";
import userValidation from "../validation/admin/user-validation";

import userAssetService from "../controllers/admin/userAsset";
import userAssetValidation from "../validation/admin/userAsset-validation";

import postService from "../controllers/admin/post";
import postValidation from "../validation/admin/post-validation";
import serviceRequestService from "../controllers/admin/serviceRequest";
import serviceRequestValidation from "../validation/admin/serviceRequest-validation";

import faqService from "../controllers/admin/faq";
import faqValidation from "../validation/admin/faq-validation";

import settingService from "../controllers/admin/setting";
import settingValidation from "../validation/admin/setting-validation";

import cmsService from "../controllers/admin/cms";
import cmsValidation from "../validation/admin/cms-validation";

import ourContactUsService from "../controllers/admin/ourContactUs";
import ourContactUsValidation from "../validation/admin/ourContactUs-validation";

import contactUsService from "../controllers/admin/contactUs";
import contactUsValidation from "../validation/admin/contactUs-validation";

import socialMediaService from "../controllers/admin/socialMedia";
import socialMediaValidation from "../validation/admin/socialMedia-validation";

import trainingMaterialService from "../controllers/admin/trainingMaterial";
import trainingMaterialValidation from "../validation/admin/trainingMaterial-validation";

import serviceTypeService from "../controllers/admin/serviceType";
import serviceTypeValidation from "../validation/admin/serviceType-validation";


import categoriesDisputeService from "../controllers/admin/categoriesDispute";
import categoriesDisputeValidation from "../validation/admin/categoriesDispute-validation";


import assetsService from "../controllers/admin/assets";
import assetsValidation from "../validation/admin/assets-validation";


import visitSiteService from "../controllers/admin/visitSite";
import visitSiteValidation from "../validation/admin/visitSite-validation";

import bidRequestService from "../controllers/admin/bidRequest";
import cancelReasonService from "../controllers/admin/cancelReason";
import cancelReasonValidation from "../validation/admin/cancelReason-validation";
import user from "../controllers/admin/user";
import Suggestions from "../controllers/admin/suggestions";
import ReportRequest from "../controllers/admin/reportRequest";
import Reviews from "../controllers/user/reviews";
import CommissionHistory from "../controllers/admin/CommissionHistory";
import PaymentTransaction from "../controllers/admin/paymentTransaction";
import earning from "../controllers/admin/earning";
import myServices from "../controllers/admin/myServices";
import whyMaintenance from "../controllers/admin/whyMaintenance";
import whyMaintenanceValidation from "../validation/admin/whyMaintenance-validation";
import sensor from "../controllers/user/sensor";

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Constants
const adminRouter = Router();
adminRouter.use(decMiddleware.DecryptedData);
adminRouter.use(authAdmin);

adminRouter.get("/dashboard", authService.dashboard);
adminRouter.post("/change-password", authService.changePassword);
adminRouter.post("/logout", authService.logout);
adminRouter.post("/profile-update", authService.updateProfile);
adminRouter.get("/profile", authService.getProfile);


// *******************************************************************************************
// ================================== Start Setting  Route =======================================
// *******************************************************************************************

adminRouter.get("/setting/get", settingService.get);
adminRouter.post("/setting/store", settingValidation.store, settingService.store);
adminRouter.get("/setting/edit-get", commonValidation.idRequiredQuery, settingService.edit);
adminRouter.delete("/setting/delete", commonValidation.idRequiredQuery, settingService.destroy);
adminRouter.post("/setting/change-status", commonValidation.idRequired, settingService.changeStatus);

// *******************************************************************************************
// ================================== End Setting  Route =========================================
// *******************************************************************************************



// *******************************************************************************************
// ================================== Start Socila Media  Route =======================================
// *******************************************************************************************

adminRouter.get("/social-media/get", socialMediaService.get);
adminRouter.post("/social-media/store", socialMediaValidation.store, socialMediaService.store);
adminRouter.get("/social-media/edit-get", commonValidation.idRequiredQuery, socialMediaService.edit);
adminRouter.delete("/social-media/delete", commonValidation.idRequiredQuery, socialMediaService.destroy);
adminRouter.post("/social-media/change-status", commonValidation.idRequired, socialMediaService.changeStatus);

// *******************************************************************************************
// ================================== End Socila Media  Route =========================================
// *******************************************************************************************

//why maintenance master

adminRouter.get("/why-maintenance-master/get", whyMaintenance.get);
adminRouter.post("/why-maintenance-master/store", whyMaintenanceValidation.store, whyMaintenance.store);
adminRouter.get("/why-maintenance-master/edit-get", commonValidation.idRequiredQuery, whyMaintenance.edit);
adminRouter.delete("/why-maintenance-master/delete", commonValidation.idRequiredQuery, whyMaintenance.destroy);
// adminRouter.post("/why-maintenance-master/change-status", commonValidation.idRequired, whyMaintenance.changeStatus);

//end

// *******************************************************************************************
// ================================== Start Faqs Route =======================================
// *******************************************************************************************

adminRouter.get("/categories-dispute/get", categoriesDisputeService.get);
adminRouter.post("/categories-dispute/store", categoriesDisputeValidation.store, categoriesDisputeService.store);
adminRouter.get("/categories-dispute/edit-get", commonValidation.idRequiredQuery, categoriesDisputeService.edit);
adminRouter.delete("/categories-dispute/delete", commonValidation.idRequiredQuery, categoriesDisputeService.destroy);
adminRouter.post("/categories-dispute/change-status", commonValidation.idRequired, categoriesDisputeService.changeStatus);

// *******************************************************************************************
// ================================== End Faqs Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start Faqs Route =======================================
// *******************************************************************************************

adminRouter.get("/faq/get", faqService.get);
adminRouter.post("/faq/store", faqValidation.store, faqService.store);
adminRouter.get("/faq/edit-get", commonValidation.idRequiredQuery, faqService.edit);
adminRouter.delete("/faq/delete", commonValidation.idRequiredQuery, faqService.destroy);
adminRouter.post("/faq/change-status", commonValidation.idRequired, faqService.changeStatus);

// *******************************************************************************************
// ================================== End Faqs Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start cancel Reason Route =======================================
// *******************************************************************************************

adminRouter.get("/cancel-reason/get", cancelReasonService.get);
adminRouter.post("/cancel-reason/store", cancelReasonValidation.store, cancelReasonService.store);
adminRouter.get("/cancel-reason/edit-get", commonValidation.idRequiredQuery, cancelReasonService.edit);
adminRouter.delete("/cancel-reason/delete", commonValidation.idRequiredQuery, cancelReasonService.destroy);
adminRouter.post("/cancel-reason/change-status", commonValidation.idRequired, cancelReasonService.changeStatus
);

// *******************************************************************************************
// ================================== End cancel Reason Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start service Type Route =======================================
// *******************************************************************************************

adminRouter.get("/service-type/get", serviceTypeService.get);
adminRouter.post("/service-type/store", serviceTypeValidation.store, serviceTypeService.store);
adminRouter.get("/service-type/edit-get", commonValidation.idRequiredQuery, serviceTypeService.edit);
adminRouter.delete("/service-type/delete", commonValidation.idRequiredQuery, serviceTypeService.destroy);
adminRouter.post("/service-type/change-status", commonValidation.idRequired, serviceTypeService.changeStatus
);

// *******************************************************************************************
// ================================== End service Type Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start assets Route =======================================
// *******************************************************************************************

adminRouter.get("/assets/get", assetsService.get);
adminRouter.post("/assets/store", assetsValidation.store, assetsService.store);
adminRouter.get("/assets/edit-get", commonValidation.idRequiredQuery, assetsService.edit);
adminRouter.delete("/assets/delete", commonValidation.idRequiredQuery, assetsService.destroy);
adminRouter.post("/assets/change-status", commonValidation.idRequired, assetsService.changeStatus
);

// *******************************************************************************************
// ================================== End service-request Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start service-request Route =======================================
// *******************************************************************************************

adminRouter.get("/service-request/get", serviceRequestService.get);
adminRouter.post("/service-request/store", serviceRequestValidation.store, serviceRequestService.store);
adminRouter.get("/service-request/edit-get", commonValidation.idRequiredQuery, serviceRequestService.edit);
adminRouter.delete("/service-request/delete", commonValidation.idRequiredQuery, serviceRequestService.destroy);
adminRouter.post("/service-request/change-status", commonValidation.idRequired, serviceRequestService.changeStatus);
adminRouter.post("/service-request/close-admin", commonValidation.idRequired, serviceRequestService.closeByAdmin);

// *******************************************************************************************
// ================================== End service-request Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start category Route =======================================
// *******************************************************************************************

adminRouter.get("/category/get", categoryService.get);
adminRouter.post("/category/store", categoryValidation.store, categoryService.store);
adminRouter.get("/category/edit-get", commonValidation.idRequiredQuery, categoryService.edit);
adminRouter.delete("/category/delete", commonValidation.idRequiredQuery, categoryService.destroy);
adminRouter.post("/category/change-status", commonValidation.idRequired, categoryService.changeStatus);

// *******************************************************************************************
// ================================== End category Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start user Route =======================================
// *******************************************************************************************

adminRouter.get("/user/getAll", userService.getAll);
adminRouter.get("/user/export", userService.exportUser);
adminRouter.get("/user/get", userService.get);
adminRouter.post("/user/store", userValidation.store, userService.store);
adminRouter.get("/user/edit-get", commonValidation.idRequiredQuery, userService.edit);
adminRouter.delete("/user/delete", commonValidation.idRequiredQuery, userService.destroy);
adminRouter.post("/user/change-status", commonValidation.idRequired, userService.changeStatus);
adminRouter.post("/user/change-status-firebase", commonValidation.idRequired, userService.changeStatusFirebase);
adminRouter.post("/user/change-status-email", commonValidation.idRequired, userService.changeStatusEmail);

adminRouter.get("/user-asset/get", userAssetService.get);
adminRouter.post("/user-asset/store", userAssetService.store);  // validation : userAssetValidation.store,
adminRouter.get("/user-asset/edit-get", commonValidation.idRequiredQuery, userAssetService.edit);
adminRouter.delete("/user-asset/delete", commonValidation.idRequiredQuery, userAssetService.destroy);
adminRouter.post("/user-asset/change-status", commonValidation.idRequired, userAssetService.changeStatus);


adminRouter.get("/visit-site/get", visitSiteService.get);
adminRouter.post("/visit-site/store", visitSiteValidation.store, visitSiteService.store);
adminRouter.get("/visit-site/edit-get", commonValidation.idRequiredQuery, visitSiteService.edit);
adminRouter.delete("/visit-site/delete", commonValidation.idRequiredQuery, visitSiteService.destroy);
adminRouter.post("/visit-site/change-status", commonValidation.idRequired, visitSiteService.changeStatus);


// user
adminRouter.post("/user/changeUserPassword", userValidation.changePasswordValidation, user.changeUserPassword);
adminRouter.post("/user/notification", user.sendNotification);


// *******************************************************************************************
// ================================== End user Route =========================================
// *******************************************************************************************


// *******************************************************************************************
// ================================== Start Sub-Admin-Request Route =======================================
// *******************************************************************************************

adminRouter.post("/sub-admin/store", userValidation.store, userService.store);

// *******************************************************************************************
// ================================== End Sub-Admin-Request Route =======================================
// *******************************************************************************************


// *******************************************************************************************
// ================================== Start post Route =======================================
// *******************************************************************************************

adminRouter.get("/post/get", postService.get);
adminRouter.get("/post/get-comment", postService.getComment);

adminRouter.post("/post/store", postValidation.store, postService.store);
adminRouter.get("/post/edit-get", commonValidation.idRequiredQuery, postService.edit);
adminRouter.delete("/post/delete", commonValidation.idRequiredQuery, postService.destroy);
adminRouter.post("/post/change-status", commonValidation.idRequired, postService.changeStatus);
adminRouter.delete("/post/delete-comment", commonValidation.idRequiredQuery, postService.deletePostComment);

// *******************************************************************************************
// ================================== End user Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start setting Route =======================================
// *******************************************************************************************

adminRouter.get("/setting/get", settingService.get);
adminRouter.post("/setting/store", settingValidation.store, settingService.store);

// *******************************************************************************************
// ================================== End setting Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start cms Route =======================================
// *******************************************************************************************

adminRouter.get("/cms/get", cmsService.get);
adminRouter.post("/cms/store", cmsValidation.store, cmsService.store);

// *******************************************************************************************
// ================================== End cms Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start cms Route =======================================
// *******************************************************************************************

adminRouter.get("/our-contact-us/get", ourContactUsService.get);
adminRouter.post("/our-contact-us/store", ourContactUsValidation.store, ourContactUsService.store);

// *******************************************************************************************
// ================================== End cms Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start cms Route =======================================
// *******************************************************************************************

// adminRouter.get("/cms/get", cmsService.get);
// adminRouter.post("/cms/store", cmsValidation.store, cmsService.store);

// *******************************************************************************************
// ================================== End cms Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start contact_us Route =======================================
// *******************************************************************************************

adminRouter.get("/contact-us/get", contactUsService.get);
adminRouter.post("/contact-us/store", contactUsValidation.store, contactUsService.store);
adminRouter.get("/contact-us/edit-get", commonValidation.idRequiredQuery, contactUsService.edit);
adminRouter.delete("/contact-us/delete", commonValidation.idRequiredQuery, contactUsService.destroy);
adminRouter.post("/contact-us/change-status", commonValidation.idRequired, contactUsService.changeStatus);

// *******************************************************************************************
// ================================== End contact_us Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start training-material Route =======================================
// *******************************************************************************************

adminRouter.get("/training-material/get", trainingMaterialService.get);
adminRouter.post("/training-material/store", trainingMaterialValidation.store, trainingMaterialService.store);
adminRouter.get("/training-material/edit-get", commonValidation.idRequiredQuery, trainingMaterialService.edit);
adminRouter.delete("/training-material/delete", commonValidation.idRequiredQuery, trainingMaterialService.destroy);
adminRouter.post("/training-material/change-status", commonValidation.idRequired, trainingMaterialService.changeStatus);

// *******************************************************************************************
// ================================== End training-material Route =========================================
// *******************************************************************************************

// *******************************************************************************************
// ================================== Start Bid-Request Route =======================================
// *******************************************************************************************
adminRouter.get("/bids/by-service_request_id", bidRequestService.getByServiceReqId); //a
adminRouter.get("/bid/detail-get", bidRequestService.bidDetailView); //a

// *******************************************************************************************
// ================================== End Bid-Request Route =======================================
// *******************************************************************************************

//Suggestion

adminRouter.get("/suggestions/get", Suggestions.get);

// report user

adminRouter.get("/report-request/get", ReportRequest.get);
adminRouter.post("/report-request/edit", ReportRequest.editStatus)
adminRouter.delete("/report-request/delete", commonValidation.idRequiredQuery, ReportRequest.destroy);

adminRouter.post("/get-reviews", Reviews.getByVendorId);

// provider commission 
adminRouter.post("/commission-history", CommissionHistory.store);
adminRouter.get("/commission-history/get", CommissionHistory.getCommissionHistory)
adminRouter.get("/payment-transaction", PaymentTransaction.get)

// my earning
adminRouter.get("/my-earning/get", earning.get)

adminRouter.get("/my-services/get", myServices.get);

// sensor data get
adminRouter.get("/location", sensor.get);


// Export default
export default adminRouter;
