const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const sequelize = require("./config/db");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  })
);

app.use("/public", express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("message", (data) => {
    console.log("📩 Message received:", data);
    io.emit("message", { text: "New message broadcasted", data });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");

    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log("🔁 Models synchronized with database (force: true)");

    require("./src/CreateData/create_data");
  })
  .catch((err) => {
    console.error("❌ Database connection or sync failed:", err);
  });

app.get("/", (req, res) => {
  res.send("🚀 Multi-Business RepairCRM Server Running Successfully!");
});

const userRoutes = require("./src/auth/user_route");
app.use("/api", userRoutes);

const brandRoute = require("./src/Brands/brand_route");
app.use("/api", brandRoute);

const paymentTypeRoute = require("./src/PaymentType/payment_type_route");
app.use("/api", paymentTypeRoute);

const taxroute = require("./src/Tax/tax_route");
app.use("/api", taxroute);

const productRoute = require("./src/product/product_route");
app.use("/api", productRoute);

const customerRoute = require("./src/Customer/customer_route");
app.use("/api", customerRoute);

const repairRoute = require("./src/Repair/repair_route");
app.use("/api", repairRoute);

const categoryRoute = require("./src/category/category_route");
app.use("/api", categoryRoute);

const StatusRoute = require("./src/Status/status_route");
app.use("/api", StatusRoute);

const CustomerAddressRoute = require("./src/CustomerAddress/customer_address_route");
app.use("/api", CustomerAddressRoute);

const RoleRoute = require("./src/roles/role_routes");
app.use("/api", RoleRoute);

const PermissionRoute = require("./src/permissions/permission_route");
app.use("/api", PermissionRoute);

const Workflow = require("./src/WorkFLow/work_flow_route");
app.use("/api", Workflow);

const sourceRoutes = require("./src/Source/source_route");
app.use("/api", sourceRoutes);

const repairTypeRoutes = require("./src/RepairType/repair_type_routes");
app.use("/api", repairTypeRoutes);

const deviceTypeRoutes = require("./src/DeviceType/device_type_routes");
app.use("/api", deviceTypeRoutes);

const accessoriesRoutes = require("./src/Accessories/accessories_routes");
app.use("/api", accessoriesRoutes);

const serviceRoutes = require("./src/Services/service_routes");
app.use("/api", serviceRoutes);

const deviceModelRoutes = require("./src/DeviceModel/device_model_route");
app.use("/api", deviceModelRoutes);

const ServiceTypeRoutes = require("./src/ServicesType/services_type_route");
app.use("/api", ServiceTypeRoutes);

const HardwareConfigurationRoutes = require("./src/Hardware Configuration/hardware_configuration_route");
app.use("/api", HardwareConfigurationRoutes);

const DeviceColorRoutes = require("./src/Device Color/device_color_routes");
app.use("/api", DeviceColorRoutes);

const StorageLocationRoutes = require("./src/StorageLocation/storage_location_routes");
app.use("/api", StorageLocationRoutes);


const StageRemark = require("./src/StageChangeRemark/stage_change_remark_route");
app.use("/api", StageRemark);

const OPTRoute = require("./src/OTP/otp_route");
app.use("/api", OPTRoute);

const QuotationAndBilling = require("./src/Repair/QuotationAndBilling/quotation_and_billing_route");
app.use("/api", QuotationAndBilling);

const inventory = require("./src/inventory/inventory_route");
app.use("/api", inventory);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
