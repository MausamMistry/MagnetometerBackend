import { Router } from 'express';
import commonService from '../controllers/common/common';
import decMiddleware from "../helper/decryptData";

// Constants
const commonRouter = Router();
commonRouter.use(decMiddleware.DecryptedData);

commonRouter.get('/category', commonService.getCategory);
commonRouter.post('/post-like-unlike', commonService.storePostLike);
commonRouter.post('/post-comment', commonService.storePostComment);
commonRouter.post('/post-comment-get', commonService.getPostComment);
commonRouter.post('/recent-post-get', commonService.getRecentPost);
commonRouter.get('/categories-dispute', commonService.getCategoriesDispute);

commonRouter.post('/service-type-active', commonService.getServiceType);
commonRouter.post('/assets-active', commonService.getAssets);
commonRouter.post('/cancel-reason-active', commonService.getCancelReason);
commonRouter.post('/admin-active', commonService.GetActiveAdmin);
commonRouter.post('/vendor-active', commonService.GetActiveVendor);
commonRouter.post('/customer-active', commonService.GetActiveCustomer);



commonRouter.get("/asset-category-get", commonService.getAssetsCategory);
commonRouter.get("/asset-uses-get", commonService.getUses);
commonRouter.get("/asset-structure-type-get", commonService.getStructureType);
commonRouter.get("/asset-facade-type-get", commonService.getFacadeType);
commonRouter.get("/social-media-get", commonService.getSocialMedia);
commonRouter.post("/priority-get", commonService.getPriority);
commonRouter.post("/our-contact-us-get", commonService.getOurContactUs);

commonRouter.get("/service-request/get-update-dispute", commonService.getDisputeDetails);
commonRouter.post("/service-request/update-dispute", commonService.updateDispute);
commonRouter.get("/why-maintenance-master/get", commonService.getWhyMaintenance);




// Export default
export default commonRouter;
