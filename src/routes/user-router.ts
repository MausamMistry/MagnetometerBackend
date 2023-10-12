import { Router } from "express";
import { authUser } from "../middleware/user-guard";
import decMiddleware from "../helper/decryptData";
import commonValidation from "../validation/common-validation";
import authService from "../controllers/user/auth";
import myAssetService from "../controllers/user/myAssets";
import serviceRequestService from "../controllers/user/serviceRequest";
import BidsService from "../controllers/user/bidRequest";
import CardsService from "../controllers/user/paymentMethods";
import visitRequestService from "../controllers/user/visitRequest";
import serviceRequestValidation from "../validation/user/serviceRequest-validation";
import bidValidation from "../validation/user/bid-validation";
import myAssetsValidation from "../validation/user/myAssets-validation";
import visitReqValidation from "../validation/user/visitRequest-validation"
import Reviews from "../controllers/user/reviews";
import authValidation from "../validation/user/auth-validation";
import cardValidation from "../validation/user/card-validation";
import reportRequest from "../controllers/user/reportRequest";
import paymentTransaction from "../controllers/user/paymentTransaction";
import reportRequestValidation from "../validation/user/reportRequest-validation";
import myEarning from "../controllers/user/myEarning";
import servicesType from "../controllers/user/servicesType";
import myServices from "../controllers/user/myServices";
import myServicesValidation from "../validation/user/myServices-validation";
import paymentValidation from "../validation/user/payment-validation";
// Constants
const customerRouter = Router();
customerRouter.use(decMiddleware.DecryptedData);
customerRouter.use(authUser);

customerRouter.post("/change-password", authValidation.changePassword, authService.changePassword);
customerRouter.post("/logout", authService.logout);
customerRouter.post("/profile-update", authValidation.profile, authService.updateProfile);
customerRouter.post("/upload-brochure", authValidation.uploadBrochure, authService.uploadBrochure);
customerRouter.get("/profile", authService.getProfile);
customerRouter.post("/notification", authService.getNotification);
customerRouter.delete("/notification", authService.clearNotification);
customerRouter.post("/selected-notification-remove", authService.clearSelectedNotification);
customerRouter.get("/notification/count", authService.getCountNotification);
customerRouter.get("/notification/read", authService.readNotification);


// Service Request
customerRouter.post("/service-request/get", serviceRequestService.get);
customerRouter.post("/service-request", serviceRequestValidation.store, serviceRequestService.store);
customerRouter.get("/service-request/get-by-id", serviceRequestService.edit)
customerRouter.post("/service-request/complete", serviceRequestValidation.completed, serviceRequestService.completed);
customerRouter.post("/service-request/close", serviceRequestValidation.closeRequest, serviceRequestService.closeRequest);
customerRouter.post("/service-request/rate", serviceRequestValidation.RateToSp, serviceRequestService.RateSP);
customerRouter.post("/service-request/dispute", serviceRequestValidation.raiseDisputeValidation, serviceRequestService.riseDispute);
customerRouter.get("/service-request/report", commonValidation.idRequiredQuery, serviceRequestService.getComplishmentReport); //a
customerRouter.get("/service-request-slug", serviceRequestValidation.getBySlug, serviceRequestService.getBySlug);
customerRouter.post("/service-request/bids", serviceRequestValidation.getByServiceReqId, BidsService.getByServiceReqId);
customerRouter.get("/service-request/get-dispute", commonValidation.idRequiredQuery, serviceRequestService.getDisputeDetails);
customerRouter.post("/service-request/update-dispute", serviceRequestValidation.updateDispute, serviceRequestService.updateDispute);
customerRouter.post("/service-request/accomplishment-report", serviceRequestValidation.complishmentReportValidation, serviceRequestService.storeAccomplishementReport);
customerRouter.post("/service-request/dispute-admin-contact", serviceRequestValidation.disputeConatctAdmin, serviceRequestService.disputeConatctAdmin);
//Visit Request
customerRouter.post("/site-visit-user", visitRequestService.get)
customerRouter.get("/site-visit/:id", commonValidation.idRequiredParams, visitRequestService.getByServiceReqId);
customerRouter.post("/site-visit", visitReqValidation.store, visitRequestService.create)

// Bid Request

customerRouter.get("/bids", BidsService.getByVendorId);
customerRouter.post("/bid/accept", bidValidation.bidAcceptValidation, BidsService.bidAccept);
customerRouter.post("/bid/reject", commonValidation.idRequiredParams, BidsService.bidReject);
customerRouter.post("/bid", commonValidation.idRequired, BidsService.bidDetailView);  //a
customerRouter.post("/bid-request", bidValidation.store, BidsService.store)


customerRouter.post("/earning/money-collected", commonValidation.idRequiredParams, myEarning.moneyCollected);
// Bid Request Vendor

// Payment Method
customerRouter.post("/card", cardValidation.store, CardsService.store);
customerRouter.get("/cards", CardsService.getAll);
customerRouter.get("/get-card-by-id", commonValidation.idRequiredQuery, CardsService.getCard);
customerRouter.delete("/card/delete", commonValidation.idRequiredQuery, CardsService.destroy);

//service Type

//myAssets Management
customerRouter.post("/my-assets", myAssetsValidation.store, myAssetService.store);
customerRouter.get("/my-assets-get", myAssetService.get);
customerRouter.get("/my-assets-edit", commonValidation.idRequiredQuery, myAssetService.edit)
customerRouter.delete("/my-assets-delete", commonValidation.idRequiredQuery, myAssetService.destroy)
customerRouter.post("/user-asset/change-status", commonValidation.idRequired, myAssetService.changeStatus);

//Vendor Management

customerRouter.post("/get-reviews", Reviews.getByVendorId)

//report User and Provider
customerRouter.post("/report-request", reportRequestValidation.store, reportRequest.store);
customerRouter.post("/make-payment", paymentValidation.store, paymentTransaction.store);

//my earning 
customerRouter.get("/my-earning/get", myEarning.get)

//service-type 

customerRouter.get("/services-type/get", servicesType.getlist);

customerRouter.post("/my-services", myServicesValidation.store, myServices.store);
customerRouter.get("/my-services/get", myServices.get);
customerRouter.post("/my-service/notes", myServices.addUpdateOurServiceNotes)
customerRouter.get("/dashboard", authService.dashboardCustomer);

// Export default
export default customerRouter;
