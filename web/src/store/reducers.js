import { combineReducers } from "redux";

// Front
import Layout from "./layouts/reducer";

// Authentication
import Login from "./auth/login/reducer";
import Account from "./auth/register/reducer";
import ForgetPassword from "./auth/forgetpwd/reducer";
import Profile from "./auth/profile/reducer";

//Calendar
import Calendar from "./calendar/reducer";
//Chat
import chat from "./chat/reducer";
//Ecommerce
import Ecommerce from "./ecommerce/reducer";

//Project
import Projects from "./projects/reducer";

// Tasks
import Tasks from "./tasks/reducer";
//Form advanced
import changeNumber from "./formAdvanced/reducer";

//Crypto
import Crypto from "./crypto/reducer";

//TicketsList
import Tickets from "./tickets/reducer";
//Crm
import Crm from "./crm/reducer";

//Invoice
import Invoice from "./invoice/reducer";

//Mailbox
import Mailbox from "./mailbox/reducer";

// Dashboard Analytics
import DashboardAnalytics from "./dashboardAnalytics/reducer";

// Dashboard CRM
import DashboardCRM from "./dashboardCRM/reducer";

// Dashboard Ecommerce
import DashboardEcommerce from "./dashboardEcommerce/reducer";

// Dashboard Cryto
import DashboardCrypto from "./dashboardCrypto/reducer";

// Dashboard Cryto
import DashboardProject from "./dashboardProject/reducer";

// Dashboard NFT
import DashboardNFT from "./dashboardNFT/reducer";

// Pages > Team
import Team from "./team/reducer";

// File Manager
import FileManager from "./fileManager/reducer";

// To do
import Todos from "./todos/reducer";
//Jobs
import Jobs from "./job/reducer";
//API Key
import APIKey from "./apikey/reducer";
import { TaxReducer } from "./Tax";
import { CategoryReducer } from "./category";
import { BrandReducer } from "./Brand";
import { PaymentTypeReducer } from "./PaymentMode";
import { StatusReducer } from "./Status";
import { UserReducer } from "./User";
import { TechnicianReducer } from "./Technician";
import { DeliveryBoyReducer } from "./DeliveryAndPickUpBoy";
import CustomerAddressReducer from "./CustomerAddress";
import CustomerReducer from "./Customer";
import { roleReducer } from "./Role";
import { BusinessReducer } from "./Business";
import { RepairReducer } from "./Repairing";
import { ProductReducer } from "./product";
import { WorkflowReducer } from "./Workflow";
import { AccessoriesReducer } from "./Accessories";
import { DeviceTypeReducer } from "./DeviceType";
import { RepairTypeReducer } from "./RepairType";
import { SourceReducer } from "./Source";
import { ServiceReducer } from "./Service";
import { DeviceModelReducer } from "./DeviceModel";
import { ServiceTypeReducer } from "./ServiceType";
import { HardwareConfigurationReducer } from "./HardwareConfiguration";
import { StorageLocationReducer } from "./StorageLocation";
import { DeviceColorReducer } from "./DeviceColor";
import { OtpReducer } from "./StageRemark";
import { StageRemarkReducer } from "./StageRemarkData";
import { QuotationBillingReducer } from "./QuotationAndBilling";
import { CartReducer } from "./AddToCart";
import { SliderReducer } from "./slider";
import { StoreFeatureReducer } from "./StoreFeatures";
import { OrderReducer } from "./order";
import { SupplierReducer } from "./Supplier";
import { BeadingReducer } from "./Beading";
import { RequestsReducer } from "./Requests";

const rootReducer = combineReducers({
  // public
  Layout,
  Login,
  Account,
  ForgetPassword,
  Profile,
  Calendar,
  chat,
  Projects,
  Ecommerce,
  Tasks,
  changeNumber,
  Crypto,
  Tickets,
  Crm,
  Invoice,
  TaxReducer,
  RequestsReducer,
  OrderReducer,
  CustomerReducer,
  SourceReducer,
  HardwareConfigurationReducer,
  ServiceReducer,
  StorageLocationReducer,
  DeviceColorReducer,
  DeviceModelReducer,
  StoreFeatureReducer,
  ServiceTypeReducer,
  BusinessReducer,
  OtpReducer,
  StageRemarkReducer,
  BeadingReducer,
  RepairReducer,
  roleReducer,
  SliderReducer,
  PaymentTypeReducer,
  StatusReducer,
  CustomerAddressReducer,
  DeviceTypeReducer,
  RepairTypeReducer,
  UserReducer,
  DeliveryBoyReducer,
  TechnicianReducer,
  CategoryReducer,
  BrandReducer,
  Mailbox,
  DashboardAnalytics,
  DashboardCRM,
  DashboardEcommerce,
  DashboardCrypto,
  DashboardProject,
  DashboardNFT,
  ProductReducer,
  AccessoriesReducer,
  WorkflowReducer,
  SupplierReducer,
  CartReducer,
  QuotationBillingReducer,
  // Team,
  // FileManager,
  // Todos,
  // Jobs,
  // APIKey,p
});

export default rootReducer;
