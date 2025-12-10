import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Tooltip,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Modal,
} from "reactstrap";

import { Swiper, SwiperSlide } from "swiper/react";
import classnames from "classnames";

// ✅ NEW: Import modules from 'swiper/modules' path
import { FreeMode, Navigation, Thumbs } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { Link } from "react-router-dom";
// import BreadCrumb from "../../Components/Common/BreadCrumb"; // Removed as it's typically for pages, not modals
import { api } from "../../config";
import ProductUpdate from "./ProductUpdate"; // Assuming this component exists
import { useDispatch, useSelector } from "react-redux";
import { getProductList } from "../../store/product"; // Assuming this Redux action exists
import AuthUser from "../../helpers/AuthType/AuthUser"; // Assuming this helper exists
import { formatDateTime } from "../../helpers/date_and_time_format"; // Assuming this helper exists

// ✅ CORRECTION: Import the default image as requested
import defaultImage from "../../assets/images/productdefaultimg/istockphoto-1396814518-612x612.jpg";

// --- Supporting Component: ProductReview ---
// (Kept commented out as it was in the original request's main component body)
/*
const ProductReview = (props) => {
  // ... Review component implementation
};
*/

// --- Supporting Component: PricingWidgetList ---
const PricingWidgetList = (props) => {
  return (
    <React.Fragment>
      <Col lg={3} sm={6}>
        <div className="p-2 border border-dashed rounded">
          <div className="d-flex align-items-center">
            <div className="avatar-sm me-2">
              <div className="avatar-title rounded bg-transparent text-success fs-24">
                <i className={props.pricingDetails.icon}></i>
              </div>
            </div>
            <div className="flex-grow-1">
              <p className="text-muted mb-1">{props.pricingDetails.label} :</p>
              <h5 className="mb-0">{props.pricingDetails.labelDetail}</h5>
            </div>
          </div>
        </div>
      </Col>
    </React.Fragment>
  );
};


// --- Main Component: ProductView ---
function ProductView(props) {
  const { BusinessData, user } = AuthUser();
  const { isProductData } = props;
  const dispatch = useDispatch();
  const products = useSelector((state) => state.ProductReducer.products);

  const [filteredProduct, setFilteredProduct] = useState({});

  useEffect(() => {
    dispatch(getProductList());
  }, [dispatch]);

  useEffect(() => {
    if (isProductData && products.length > 0) {
      const matched = products.find(
        (p) => p.product_id === isProductData.product_id
      );
      setFilteredProduct(matched || {});
    }
  }, [isProductData, products]);

  // Safely parse JSON array of image names, default to empty array
  // Use a fallback to ensure it's a valid string for JSON.parse
  const imageArray = JSON.parse(filteredProduct.product_image || "[]");

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [ttop, setttop] = useState(false);
  const [isProduct, setIsProduct] = useState({});
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [customActiveTab, setcustomActiveTab] = useState("1");

  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
  };

  // Set document title inside the component (mostly relevant if this were a page)
  useEffect(() => {
    document.title = "Product Details";
  }, []);

  const productDetailsWidgets = [
    {
      label: "MRP",
      labelDetail: filteredProduct.product_mrp || "0",
      icon: "bx bx-rupee",
    },
    {
      label: "Sale Price",
      labelDetail: filteredProduct.product_sale_price || "0",
      icon: "bx bx-purchase-tag",
    },
    {
      label: "Tax",
      labelDetail: `${filteredProduct.tax_percentage || 0}%`,
      icon: "bx bx-calculator",
    },
    {
      label: "Purchase",
      labelDetail: filteredProduct.product_purchase_price || "0",
      icon: "bx bx-cart",
    },
  ];

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={props.toggle}
      centered
      scrollable={true}
      id="exampleModalScrollable"
      size="xl"
      className="modal-dialog-scrollable"
    >
      {/* Modal Header */}
      <div className="modal-header">
        <h5 className="modal-title">Product Details</h5>
        <button
          type="button"
          className="btn-close"
          onClick={props.toggle}
          aria-label="Close"
        ></button>
      </div>

      <div className="modal-body">
        <Container fluid>
          <Row>
            <Col lg={12}>
              <Card className="shadow-none border-0">
                <CardBody>
                  <Row className="gx-lg-5">
                    <Col xl={4} md={8} className="mx-auto">
                      <div className="product-img-slider sticky-side-div">

                        {/* 1. Main Product Slider (Navigation + Thumbs) */}
                        <Swiper
                          modules={[Navigation, Thumbs]}
                          navigation={true}
                          thumbs={{ swiper: thumbsSwiper }}
                          className="swiper product-thumbnail-slider p-2 rounded bg-light"
                        >
                          <div className="swiper-wrapper">
                            {imageArray?.length > 0 ? (
                              imageArray.map((imgName, index) => (
                                <SwiperSlide key={index}>
                                  <img
                                    src={`${api.IMG_URL}product_images/${imgName}`}
                                    alt={`product-${index}`}
                                    className="img-fluid d-block"
                                  />
                                </SwiperSlide>
                              ))
                            ) : (
                              <SwiperSlide>
                                {/* ✅ CORRECTION: Use imported defaultImage */}
                                <img
                                  src={defaultImage}
                                  alt="default"
                                  className="img-fluid d-block"
                                />
                              </SwiperSlide>
                            )}
                          </div>
                        </Swiper>

                        {/* 2. Thumbnail Slider (FreeMode + Thumbs controller) */}
                        <div className="product-nav-slider mt-3">
                          <Swiper
                            modules={[FreeMode, Navigation, Thumbs]}
                            onSwiper={setThumbsSwiper}
                            slidesPerView={4}
                            freeMode={true}
                            watchSlidesProgress={true}
                            spaceBetween={12}
                            className="swiper product-nav-slider overflow-hidden"
                          >
                            {imageArray?.length > 0 ? (
                              imageArray.map((imgName, index) => (
                                <SwiperSlide
                                  key={index}
                                  style={{
                                    cursor: "pointer",
                                    transition: "transform 0.2s ease-in-out",
                                  }}
                                  onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform =
                                    "scale(1.05)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform = "scale(1)")
                                  }
                                >
                                  <div
                                    className="nav-slide-item position-relative rounded shadow-sm overflow-hidden"
                                    style={{
                                      aspectRatio: "1 / 1",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "#f8f9fa",
                                      borderRadius: "10px",
                                      height: "80px",
                                    }}
                                  >
                                    <img
                                      src={`${api.IMG_URL}product_images/${imgName}`}
                                      alt={`thumb-${index}`}
                                      className="img-fluid d-block w-100 h-100"
                                      style={{
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                      }}
                                    />
                                  </div>
                                </SwiperSlide>
                              ))
                            ) : (
                              <SwiperSlide>
                                {/* ✅ CORRECTION: Use imported defaultImage for thumbnail placeholder */}
                                <div
                                  className="nav-slide-item position-relative rounded shadow-sm overflow-hidden"
                                  style={{
                                    aspectRatio: "1 / 1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: "10px",
                                    height: "80px",
                                  }}
                                >
                                  <img
                                    src={defaultImage}
                                    alt="default-thumb"
                                    className="img-fluid d-block w-100 h-100"
                                    style={{ objectFit: "cover", borderRadius: "10px" }}
                                  />
                                </div>
                              </SwiperSlide>
                            )}
                          </Swiper>
                        </div>
                      </div>
                    </Col>

                    {/* Product Details Section */}
                    <Col xl={8}>
                      <div className="mt-xl-0 mt-5">
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <h4>{filteredProduct.product_name}</h4>
                            <div className="hstack gap-3 flex-wrap">
                              <div className="text-muted">
                                Seller :{" "}
                                <span className="text-body fw-medium">
                                  {BusinessData?.user_name}
                                </span>
                              </div>
                              <div className="vr"></div>
                              <div className="text-muted">
                                Published :{" "}
                                <span className="text-body fw-medium">
                                  {formatDateTime(filteredProduct?.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {user.user_type != 6 && <div>
                              <Tooltip
                                placement="top"
                                isOpen={ttop}
                                target="TooltipTop"
                                toggle={() => {
                                  setttop(!ttop);
                                }}
                              >
                                Edit Product
                              </Tooltip>
                              <a
                                onClick={() => {
                                  setIsProduct(filteredProduct);
                                  setIsUpdateModalOpen(true);
                                }}
                                id="TooltipTop"
                                className="btn btn-light"
                              >
                                <i className="ri-pencil-fill align-bottom"></i>
                              </a>
                            </div>}
                          </div>
                        </div>

                        {/* Pricing Widgets */}
                        <Row className="mt-4">
                          {productDetailsWidgets
                            .filter(temp =>
                              user.user_type == 6 ? temp.label !== "Purchase" : true
                            )
                            .map((pricingDetails, index) => (
                              <PricingWidgetList
                                pricingDetails={pricingDetails}
                                key={index}
                              />
                            ))}
                        </Row>


                        {/* Description Tabs */}
                        <div className="product-content mt-5">
                          <h5 className="fs-14 mb-3">Product Description :</h5>
                          <Nav tabs className="nav-tabs-custom nav-success">
                            <NavItem>
                              <NavLink
                                style={{ cursor: "pointer" }}
                                className={classnames({
                                  active: customActiveTab === "1",
                                })}
                                onClick={() => {
                                  toggleCustom("1");
                                }}
                              >
                                Specification
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                style={{ cursor: "pointer" }}
                                className={classnames({
                                  active: customActiveTab === "2",
                                })}
                                onClick={() => {
                                  toggleCustom("2");
                                }}
                              >
                                Details
                              </NavLink>
                            </NavItem>
                          </Nav>

                          <TabContent
                            activeTab={customActiveTab}
                            className="border border-top-0 p-4"
                            id="nav-tabContent"
                          >
                            <TabPane id="nav-speci" tabId="1">
                              <div className="table-responsive">
                                <table className="table mb-0">
                                  <tbody>
                                    <tr>
                                      <th scope="row" style={{ width: "200px" }}>
                                        Category
                                      </th>
                                      <td>
                                        {filteredProduct?.category_name || "-"}
                                      </td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Brand</th>
                                      <td>{filteredProduct?.brand_name || "-"}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Color</th>
                                      <td>{filteredProduct?.product_color || "-"}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Material</th>
                                      <td>{filteredProduct?.product_material || "-"}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Weight</th>
                                      <td> {filteredProduct?.product_weight || "-"}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </TabPane>
                            <TabPane id="nav-detail" tabId="2">
                              <div>
                                <h5 className="font-size-16 mb-3">
                                  {filteredProduct.product_name || "Product Name"}
                                </h5>

                                {/* Render CKEditor description */}
                                {filteredProduct.product_description ? (
                                  <div
                                    className="product-description"
                                    dangerouslySetInnerHTML={{
                                      __html: filteredProduct.product_description,
                                    }}
                                  />
                                ) : (
                                  <p className="text-muted">
                                    No description available.
                                  </p>
                                )}
                              </div>
                            </TabPane>
                          </TabContent>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Product Update Modal */}
      {isUpdateModalOpen && (
        <ProductUpdate
          isOpen={isUpdateModalOpen}
          toggle={() => setIsUpdateModalOpen(false)}
          isProductData={isProduct}
        />
      )}
    </Modal>
  );
}

export default ProductView;