import { all, fork } from "redux-saga/effects";
//layout
import LayoutSaga from "./layouts/saga";
//Auth
import AccountSaga from "./auth/register/saga";
import AuthSaga from "./auth/login/saga";
import ForgetSaga from "./auth/forgetpwd/saga";
import ProfileSaga from "./auth/profile/saga"; 

//calendar
import calendarSaga from "./calendar/saga";
//chat
import chatSaga from "./chat/saga";
//ecommerce
import ecommerceSaga from "./ecommerce/saga";

//Project
import projectSaga from "./projects/saga";
// Task
import taskSaga from "./tasks/saga";
// Crypto
import cryptoSaga from "./crypto/saga";
//TicketsList
import ticketsSaga from "./tickets/saga";

//crm
import crmSaga from "./crm/saga";
//invoice
import invoiceSaga from "./invoice/saga";
//mailbox
import mailboxSaga from "./mailbox/saga";

// Dashboard Analytics
import dashboardAnalyticsSaga from "./dashboardAnalytics/saga";

// Dashboard CRM
import dashboardCrmSaga from "./dashboardCRM/saga";

// Dashboard Ecommerce
import dashboardEcommerceSaga from "./dashboardEcommerce/saga";

// Dashboard Crypto
import dashboardCryptoSaga from "./dashboardCrypto/saga";

// Dashboard Project
import dashboardProjectSaga from "./dashboardProject/saga";

// Dashboard NFT
import dashboardNFTSaga from "./dashboardNFT/saga";

// Pages > Team
import teamSaga from "./team/saga";

// File Manager
import fileManager from "./fileManager/saga";

// To do
import todos from "./todos/saga";
//Jobs
import ApplicationSaga from "./job/saga";
//API Key
import APIKeysaga from "./apikey/saga"; 
import { taxSaga } from "../store/Tax/index";
import { categorySaga } from "./category";
import { brandSaga } from "./Brand";
import { paymentTypeSaga } from "./PaymentMode";
import { statusSaga } from "./Status";
import { userSaga } from "./User";
import { technicianSaga } from "./Technician";
import { deliveryBoySaga } from "./DeliveryAndPickUpBoy";
import { customerAddressSaga } from "./CustomerAddress";
import { customerSaga } from "./Customer";
import roleSaga from "./Role";
import { businessSaga } from "./Business";
import { repairSaga } from "./Repairing";
import { productSaga } from "./product";
import { workflowSaga } from "./Workflow";
import { accessoriesSaga } from "./Accessories";
import { deviceTypeSaga } from "./DeviceType";
import { repairTypeSaga } from "./RepairType";
import { sourceSaga } from "./Source";
import { serviceSaga } from "./Service";
import { deviceModelSaga } from "./DeviceModel";
import { serviceTypeSaga } from "./ServiceType";
import { hardwareConfigurationSaga } from "./HardwareConfiguration";
import { storageLocationSaga } from "./StorageLocation";
import { deviceColorSaga } from "./DeviceColor";
import { otpSaga } from "./StageRemark";
import { stageRemarkSaga } from "./StageRemarkData";
import { watchQuotationBilling } from "./QuotationAndBilling";
import { cartSaga } from "./AddToCart";
import { sliderSaga } from "./slider";
import { storeFeatureSaga } from "./StoreFeatures";
export default function* rootSaga() {
  yield all([
    //public
    fork(LayoutSaga),
    fork(categorySaga),
    fork(userSaga),
    fork(storageLocationSaga),
    fork(deviceColorSaga),
    fork(serviceTypeSaga),
    fork(deviceTypeSaga),
    fork(hardwareConfigurationSaga),
    fork(repairTypeSaga),
    fork(serviceSaga),
    fork(deviceModelSaga),
    fork(workflowSaga),
    fork(accessoriesSaga),
    fork(sliderSaga),
    fork(customerAddressSaga),
    fork(customerSaga),
    fork(roleSaga),
    fork(sourceSaga),
    fork(technicianSaga),
    fork(deliveryBoySaga),
    fork(storeFeatureSaga),
    fork(statusSaga),
    fork(paymentTypeSaga),
    fork(businessSaga),
    fork(brandSaga),
    fork(AccountSaga),
    fork(repairSaga),
    fork(AuthSaga),
    fork(ForgetSaga),
    fork(ProfileSaga),
    fork(chatSaga),
    fork(projectSaga),
    fork(taskSaga),
    fork(cryptoSaga),
    fork(ticketsSaga),
    fork(calendarSaga),
    fork(ecommerceSaga),
    fork(crmSaga),
    fork(invoiceSaga),
    fork(mailboxSaga),
    fork(dashboardAnalyticsSaga),
    fork(dashboardCrmSaga),
    fork(dashboardEcommerceSaga),
    fork(dashboardCryptoSaga),
    fork(productSaga),
    fork(cartSaga),
    fork(watchQuotationBilling),
    fork(otpSaga),
    fork(stageRemarkSaga),
    fork(dashboardProjectSaga),
    fork(dashboardNFTSaga),
    fork(teamSaga),
    fork(fileManager),
    fork(taxSaga),
    fork(todos),
    fork(ApplicationSaga),
    fork(APIKeysaga),
  ]);
}
