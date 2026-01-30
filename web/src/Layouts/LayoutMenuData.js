import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthUser from "../helpers/AuthType/AuthUser";
import { getOldRolePermissions } from "../store/Role";
import { useDispatch } from "react-redux";

const Navdata = () => {
  const history = useNavigate();
  const { user, permissions } = AuthUser();

  const [isDashboard, setIsDashboard] = useState(false);
  const [isProducts, setIsProducts] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isCustomers, setIsCustomers] = useState(false);
  const [isOrderTracking, setIsOrderTracking] = useState(false);
  const [isSettings, setIsSettings] = useState(false);
  const [isUserManagement, setIsUserManagement] = useState(false);
  const [isApps, setIsApps] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isPages, setIsPages] = useState(false);
  const [isBaseUi, setIsBaseUi] = useState(false);
  const [isAdvanceUi, setIsAdvanceUi] = useState(false);
  const [isForms, setIsForms] = useState(false);
  const [isTables, setIsTables] = useState(false);
  const [isCharts, setIsCharts] = useState(false);
  const [isIcons, setIsIcons] = useState(false);
  const [isMaps, setIsMaps] = useState(false);
  const [isMultiLevel, setIsMultiLevel] = useState(false);
  const [isDashboardCustomer, setIsDashboardCustomer] = useState(false);
  const [isRepairingCustomer, setIsRepairingCustomer] = useState(false);
  const [isCustomerSales, setIsCustomerSales] = useState(false);
  const [isQuotationBilling, setIsQuotationBilling] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);
  const [isBeading, setIsBeading] = useState(false);
  const [isReqToSupplier, setIsReqToSupplier] = useState(false);

  const [isLanding, setIsLanding] = useState(false);

  // Charts
  const [isApex, setIsApex] = useState(false);

  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "DashboardCustomer") {
      setIsDashboardCustomer(false);
    }
    if (iscurrentState !== "Beading") {
      setIsBeading(false);
    }
    if (iscurrentState !== "RequestToSupplier") {
      setIsReqToSupplier(false);
    }
    if (iscurrentState !== "Supplier") {
      setIsSupplier(false);
    }

    if (iscurrentState !== "RepairingCustomer") {
      setIsRepairingCustomer(false);
    }

    if (iscurrentState !== "CustomerSales") {
      setIsCustomerSales(false);
    }
    if (iscurrentState !== "OrderTracking") {
      setIsOrderTracking(false);
    }
    if (iscurrentState !== "QuotationBilling") {
      setIsQuotationBilling(false);
    }
    if (iscurrentState !== "Products") {
      setIsProducts(false);
    }
    if (iscurrentState !== "Business") {
      setIsBusiness(false);
    }
    if (iscurrentState !== "Repairing") {
      setIsRepairing(false);
    }
    if (iscurrentState !== "Customers") {
      setIsCustomers(false);
    }
    if (iscurrentState !== "UserManagement") {
      setIsUserManagement(false);
    }
    if (iscurrentState !== "Settings") {
      setIsSettings(false);
    }
    if (iscurrentState !== "Auth") {
      setIsAuth(false);
    }
    if (iscurrentState !== "Pages") {
      setIsPages(false);
    }
    if (iscurrentState !== "BaseUi") {
      setIsBaseUi(false);
    }
    if (iscurrentState !== "AdvanceUi") {
      setIsAdvanceUi(false);
    }
    if (iscurrentState !== "Forms") {
      setIsForms(false);
    }
    if (iscurrentState !== "Tables") {
      setIsTables(false);
    }
    if (iscurrentState !== "Charts") {
      setIsCharts(false);
    }
    if (iscurrentState !== "Icons") {
      setIsIcons(false);
    }
    if (iscurrentState !== "Maps") {
      setIsMaps(false);
    }
    if (iscurrentState !== "MuliLevel") {
      setIsMultiLevel(false);
    }
    if (iscurrentState === "Widgets") {
      history("/widgets");
      document.body.classList.add("twocolumn-panel");
    }
    if (iscurrentState !== "Landing") {
      setIsLanding(false);
    }
  }, [
    history,
    iscurrentState,
    isDashboard,
    isApps,
    isAuth,
    isPages,
    isBaseUi,
    isAdvanceUi,
    isForms,
    isTables,
    isCharts,
    isIcons,
    isProducts,
    isBusiness,
    isRepairing,
    isCustomers,
    isSettings,
    isUserManagement,
    isMaps,
    isMultiLevel,
  ]);

  const menuItems = [
    {
      label: "Menu",
      isHeader: true,
    },
    {
      id: "DASHBOARD",
      label: "Dashboard",
      icon: "mdi mdi-view-dashboard-outline",
      link: "/#",
      stateVariables: isDashboard,
      click: function (e) {
        e.preventDefault();
        setIsDashboard(!isDashboard);
        setIscurrentState("Dashboard");
        updateIconSidebar(e);
      },
    },
    // 1️⃣ Dashboard - Customer
    {
      id: "DASHBOARDCUSTOMER",
      label: "Dashboard  ",
      icon: "mdi mdi-view-dashboard-outline",
      link: "/#",
      stateVariables: isDashboardCustomer,
      click: function (e) {
        e.preventDefault();
        setIsDashboardCustomer(!isDashboardCustomer);
        setIscurrentState("DashboardCustomer");
        updateIconSidebar(e);
      },
    },

    {
      id: "REPAIRINGCUSTOMER",
      label: "Repairing  ",
      icon: "mdi mdi-tools",        // change icon if you want
      link: "/repairing-list",
      stateVariables: isRepairingCustomer,
      click: function (e) {
        e.preventDefault();
        setIsRepairingCustomer(!isRepairingCustomer);
        setIscurrentState("RepairingCustomer");
        updateIconSidebar(e);
      },
    },

    {
      id: "CUSTOMERSALES",
      label: "  Sales",
      icon: "mdi mdi-cash-multiple",
      link: "/apps-ecommerce-products",
      stateVariables: isCustomerSales,
      click: function (e) {
        e.preventDefault();
        setIsCustomerSales(!isCustomerSales);
        setIscurrentState("CustomerSales");
        updateIconSidebar(e);
      },
    },

    {
      id: "BUSINESS",
      label: "Business",
      icon: "mdi mdi-office-building-outline",
      link: "/business-list",
      stateVariables: isBusiness,
      click: function (e) {
        e.preventDefault();
        setIsBusiness(!isBusiness);
        setIscurrentState("Business");
        updateIconSidebar(e);
      },
    },

    {
      id: "REPAIRING",
      label: "Repairing",
      icon: "mdi mdi-tools",
      link: "/repairing-list",
      stateVariables: isRepairing,
      click: function (e) {
        e.preventDefault();
        setIsRepairing(!isRepairing);
        setIscurrentState("Repairing");
        updateIconSidebar(e);
      },
    },
    {
      id: "SUPPLIER",
      label: "Supplier",
      icon: "mdi mdi-truck-outline",
      link: "/supplier-list", // or whatever route you want
      stateVariables: isSupplier,
      click: function (e) {
        e.preventDefault();
        setIsSupplier(!isSupplier);
        setIscurrentState("Supplier");
        updateIconSidebar(e);
      },
    },
    {
      id: "BEADING",
      label: "Beading",
      icon: "mdi mdi-diamond-stone",
      link: "/beading-list", // adjust route if needed
      stateVariables: isBeading,
      click: function (e) {
        e.preventDefault();
        setIsBeading(!isBeading);
        setIscurrentState("Beading");
        updateIconSidebar(e);
      },
    },
    {
      id: "REQ_TO_SUPPLIER",
      label: user.user_type == 7 ? "Requests" : "Request to Supplier",
      icon: "mdi mdi-message-reply-text",
      link: "/req-to-supplier-list",
      stateVariables: isReqToSupplier,
      click: function (e) {
        e.preventDefault();
        setIsReqToSupplier(!isReqToSupplier);
        setIscurrentState("RequestToSupplier");
        updateIconSidebar(e);
      },
    },

    {
      id: "QUOTATION_BILLING",
      label: "Quotation & Billing",
      icon: "mdi mdi-file-document-edit",
      link: "/quotation-billing",
      stateVariables: isQuotationBilling,
      click: function (e) {
        e.preventDefault();
        setIsQuotationBilling(!isQuotationBilling);
        setIscurrentState("QuotationBilling");
        updateIconSidebar(e);
      },
    },

    {
      id: "PRODUCT",
      label: "Products",
      icon: "mdi mdi-cube-outline",
      link: "/products-list",
      stateVariables: isProducts,
      click: function (e) {
        e.preventDefault();
        setIsProducts(!isProducts);
        setIscurrentState("Products");
        updateIconSidebar(e);
      },
    },
    {
      id: "CUSTOMER",
      label: "Customers",
      icon: "mdi mdi-account-group-outline",
      link: "/customer-list",
      stateVariables: isCustomers,
      click: function (e) {
        e.preventDefault();
        setIsCustomers(!isCustomers);
        setIscurrentState("Customers");
        updateIconSidebar(e);
      },
    },
    {
      id: "ORDERTRACKING",
      label: "Order Tracking",
      icon: "mdi mdi-truck-check-outline",
      link: "/#",
      click: function (e) {
        e.preventDefault();
        setIsOrderTracking(!isOrderTracking);
        setIscurrentState("OrderTracking");
        updateIconSidebar(e);
      },
      stateVariables: isOrderTracking,
      subItems: [
        ...(permissions.find(
          (permission) =>
            permission.permission_category === "ORDERTRACKING" &&
            permission.permission_path === "1"
        )
          ? [
            {
              id: "allOrders",
              label: "All Orders",
              icon: "mdi mdi-format-list-bulleted",
              link: "/order-list",
              parentId: "orderTracking",
            },
          ]
          : []),

        ...(permissions.find(
          (permission) =>
            permission.permission_category === "ORDERTRACKING" &&
            permission.permission_path === "2"
        )
          ? [
            {
              id: "newOrders",
              label: "New Orders",
              icon: "mdi mdi-cart-plus",
              link: "/order-new",
              parentId: "orderTracking",
            },
          ]
          : []),

        ...(permissions.find(
          (permission) =>
            permission.permission_category === "ORDERTRACKING" &&
            permission.permission_path === "3"
        )
          ? [
            {
              id: "approvalOrders",
              label: "Approval Orders",
              icon: "mdi mdi-check-decagram-outline",
              link: "/order-approval",
              parentId: "orderTracking",
            },
          ]
          : []),

        ...(permissions.find(
          (permission) =>
            permission.permission_category === "ORDERTRACKING" &&
            permission.permission_path === "4"
        )
          ? [
            {
              id: "packingOrders",
              label: "Packing Orders",
              icon: "mdi mdi-package-variant-closed",
              link: "/order-packing",
              parentId: "orderTracking",
            },
          ]
          : []),
        ...(permissions.find(
          (permission) =>
            permission.permission_category === "ORDERTRACKING" &&
            permission.permission_path === "5"
        )
          ? [
            {
              id: "dispatchOrders",
              label: "Dispatch Orders",
              icon: "mdi mdi-truck-fast-outline",
              link: "/order-dispatch",
              parentId: "orderTracking",
            },
          ]
          : []),
        ...(permissions.find(
          (permission) =>
            permission.permission_category === "ORDERTRACKING" &&
            permission.permission_path === "6"
        )
          ? [
            {
              id: "rejectedOrders",
              label: "Rejected Orders",
              icon: "mdi mdi-close-octagon-outline",
              link: "/order-rejected",
              parentId: "orderTracking",
            },
          ]
          : []),
        ...(permissions.find(
          (permission) =>
            permission.permission_category === "ORDERTRACKING" &&
            permission.permission_path === "7"
        )
          ? [
            {
              id: "deliveredOrders",
              label: "Delivered Orders",
              icon: "mdi mdi-check-circle-outline",
              link: "/order-delivered",
              parentId: "orderTracking",
            },
          ]
          : []),
      ],
    },
    {
      id: "USERMANAGEMENT",
      label: "User Management",
      icon: "mdi mdi-account-cog-outline",
      link: "/#",
      click: function (e) {
        e.preventDefault();
        setIsUserManagement(!isUserManagement);
        setIscurrentState("UserManagement");
        updateIconSidebar(e);
      },
      stateVariables: isUserManagement,
      subItems: [
        ...(permissions.find(
          (permission) =>
            permission.permission_category == "USERMANAGEMENT" &&
            permission.permission_path == "1"
        )
          ? [
            {
              id: "role",
              label: "Roles",
              icon: "mdi mdi-account-key-outline",
              link: "/role-list",
              parentId: "userManagement",
            },
          ]
          : []),
        ...(permissions.find(
          (permission) =>
            permission.permission_category == "USERMANAGEMENT" &&
            permission.permission_path == "2"
        )
          ? [
            {
              id: "user",
              label: "Users",
              icon: "mdi mdi-account-outline",
              link: "/user-list",
              parentId: "userManagement",
            },
          ]
          : []),
        ...(permissions.find(
          (permission) =>
            permission.permission_category == "USERMANAGEMENT" &&
            permission.permission_path == "3"
        )
          ? [
            {
              id: "technician",
              label: "Technicians",
              icon: "mdi mdi-hammer-wrench",
              link: "/technician-list",
              parentId: "userManagement",
            },
          ]
          : []),
        ...(permissions.find(
          (permission) =>
            permission.permission_category == "USERMANAGEMENT" &&
            permission.permission_path == "4"
        )
          ? [
            {
              id: "deliveryBoy",
              label: "Delivery / Pickup Boys",
              icon: "mdi mdi-truck-delivery-outline",
              link: "/delivery-boy-list",
              parentId: "userManagement",
            },
          ]
          : []),
      ],
    },
    {
      id: "SETTINGS",
      label: "Settings",
      icon: "mdi mdi-cog-outline",
      link: "/#",
      click: function (e) {
        e.preventDefault();
        setIsSettings(!isSettings);
        setIscurrentState("Settings");
        updateIconSidebar(e);
      },
      stateVariables: isSettings,
      subItems: [
        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "1"
        )
          ? [
            {
              id: "accessories",
              label: "Accessories",
              icon: "mdi mdi-package-variant-closed",
              link: "/accessories-list",
              parentId: "SETTINGS",
            },
          ]
          : []),

        {
          id: "slider",
          label: "Slider",
          icon: "mdi mdi-package-variant-closed",
          link: "/slider-list",
          parentId: "SETTINGS",
        },
        {
          id: "store-feature",
          label: "Store Feature",
          icon: "mdi mdi-package-variant-closed",
          link: "/store-feature-list",
          parentId: "SETTINGS",
        },

        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "6"
        )
          ? [
            {
              id: "brand",
              label: "Brand",
              icon: "mdi mdi-tag-outline",
              link: "/brand-list",
              parentId: "SETTINGS",
            },
          ]
          : []),

        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "7"
        )
          ? [
            {
              id: "category",
              label: "Category",
              icon: "mdi mdi-shape-outline",
              link: "/category-list",
              parentId: "SETTINGS",
            },
          ]
          : []),

        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "2"
        )
          ? [
            {
              id: "deviceType",
              label: "Device Type",
              icon: "mdi mdi-cellphone-link",
              link: "/device-type-list",
              parentId: "SETTINGS",
            },
          ]
          : []),

        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "3"
        )
          ? [
            {
              id: "repairType",
              label: "Repair Type",
              icon: "mdi mdi-wrench-outline",
              link: "/repair-type-list",
              parentId: "SETTINGS",
            },
          ]
          : []),

        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "4"
        )
          ? [
            {
              id: "service",
              label: "Service",
              icon: "mdi mdi-tools",
              link: "/service-list",
              parentId: "SETTINGS",
            },
          ]
          : []),

        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "5"
        )
          ? [
            {
              id: "source",
              label: "Source",
              icon: "mdi mdi-database",
              link: "/source-list",
              parentId: "SETTINGS",
            },
          ]
          : []),
        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "13"
        )
          ? [
            {
              id: "device_model",
              label: "Device Model",
              icon: "mdi mdi-database",
              link: "/device-model-list",
              parentId: "SETTINGS",
            },
          ]
          : []),
        // ...(permissions.find(
        //   (p) =>
        //     p.permission_category === "SETTINGS" && p.permission_path === "8"
        // )
        //   ? [
        //       {
        //         id: "customeraddress",
        //         label: "Customer Address",
        //         icon: "mdi mdi-map-marker-outline",
        //         link: "/customer-address-list",
        //         parentId: "SETTINGS",
        //       },
        //     ]
        //   : []),

        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "9"
        )
          ? [
            {
              id: "payment",
              label: "Payment",
              icon: "mdi mdi-credit-card-outline",
              link: "/payment-list",
              parentId: "SETTINGS",
            },
          ]
          : []),

        // ...(permissions.find(
        //   (p) =>
        //     p.permission_category === "SETTINGS" && p.permission_path === "10"
        // )
        //   ? [
        //       {
        //         id: "status",
        //         label: "Status",
        //         icon: "mdi mdi-checkbox-marked-outline",
        //         link: "/status-list",
        //         parentId: "SETTINGS",
        //       },
        //     ]
        //   : []),

        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "11"
        )
          ? [
            {
              id: "tax",
              label: "Tax",
              icon: "mdi mdi-percent-outline",
              link: "/tax-list",
              parentId: "SETTINGS",
            },
          ]
          : []),

        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "12"
        )
          ? [
            {
              id: "workflow",
              label: "Work Flow",
              icon: "mdi mdi-cogs",
              link: "/work-flow-list",
              parentId: "SETTINGS",
            },
          ]
          : []),
        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "13"
        )
          ? [
            {
              id: "service_type",
              label: "Service Type",
              icon: "mdi mdi-cogs",
              link: "/service-type-list",
              parentId: "SETTINGS",
            },
          ]
          : []),
        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "14"
        )
          ? [
            {
              id: "hardware_configuration",
              label: "Hardware",
              icon: "mdi mdi-desktop-classic",
              link: "/hardware-configuration-list",
              parentId: "SETTINGS",
            },
          ]
          : []),
        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "15"
        )
          ? [
            {
              id: "storage_location",
              label: "Storage Location",
              icon: "mdi mdi-desktop-classic",
              link: "/storage-location-list",
              parentId: "SETTINGS",
            },
          ]
          : []),
        ...(permissions.find(
          (p) =>
            p.permission_category === "SETTINGS" && p.permission_path === "16"
        )
          ? [
            {
              id: "device_color",
              label: "Device Color ",
              icon: "mdi mdi-desktop-classic",
              link: "/device-color-list",
              parentId: "SETTINGS",
            },
          ]
          : []),
      ].sort((a, b) => a.label.localeCompare(b.label)),
    },
  ];
  let filteredMenuItems = [];

  if (user.user_type === 1) {
    // Super Admin → show all menu items
    filteredMenuItems = menuItems;
  } else {
    // Other users → filter by permission
    filteredMenuItems = menuItems.filter((menuItem) =>
      permissions.some(
        (dataItem) => menuItem.id == dataItem.permission_category
      )
    );
  }

  return (
    <React.Fragment>
      {filteredMenuItems.filter((item) => item != null)}
    </React.Fragment>
  );
};
export default Navdata;
