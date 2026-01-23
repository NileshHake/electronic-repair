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
import { FreeMode, Navigation, Thumbs } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { api } from "../../config";
import ProductUpdate from "./ProductUpdate";
import { useDispatch, useSelector } from "react-redux";
import { getAdminProductList, getProductList, resetUpdateProductResponse } from "../../store/product";
import AuthUser from "../../helpers/AuthType/AuthUser";
import { formatDateTime } from "../../helpers/date_and_time_format";
import defaultImage from "../../assets/images/productdefaultimg/istockphoto-1396814518-612x612.jpg";
import ProductActionButtons from "./component/ProductActionButtons";


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
  console.log("isProductData.product_image", isProductData.product_image);

  const imageArray = JSON.parse(isProductData.product_image || "[]");

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
      labelDetail: isProductData.product_mrp || "0",
      icon: "bx bx-rupee",
    },
    {
      label: "Sale Price",
      labelDetail: isProductData.product_sale_price || "0",
      icon: "bx bx-purchase-tag",
    },
    {
      label: "Tax",
      labelDetail: `${isProductData.tax_percentage || 0}%`,
      icon: "bx bx-calculator",
    },
    {
      label: "Purchase",
      labelDetail: isProductData.product_purchase_price || "0",
      icon: "bx bx-cart",
    },
  ];
  const updateProductResponse = useSelector(
    (state) => state.ProductReducer.updateProductResponse
  );
  useEffect(() => {
    if (updateProductResponse === true) {
      props.toggle()
    }

  }, [updateProductResponse]);
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

                        {/* ✅ Main Slider */}
                        <Swiper
                          modules={[Navigation, Thumbs]}
                          navigation={true}
                          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                          className="swiper product-thumbnail-slider p-2 rounded bg-light"
                        >
                          {(imageArray?.length ? imageArray : [null]).map((imgName, index) => (
                            <SwiperSlide key={index}>
                              <img
                                src={
                                  imgName
                                    ? `${api.IMG_URL}product_images/${imgName}`
                                    : defaultImage
                                }
                                alt={`thumb-${index}`}
                                className="img-fluid d-block rounded"
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>

                        {/* ✅ Thumbnail Slider */}
                        <div className="product-nav-slider mt-2">
                          <Swiper
                            modules={[FreeMode, Thumbs]}
                            onSwiper={setThumbsSwiper}
                            slidesPerView={4}
                            freeMode={true}
                            watchSlidesProgress={true}
                            spaceBetween={10}
                            className="swiper product-nav-slider mt-2 overflow-hidden"
                          >
                            {(imageArray?.length ? imageArray : [null]).map((imgName, index) => (
                              <SwiperSlide key={index} className="rounded">
                                <div className="nav-slide-item">
                                  <img
                                    src={
                                      imgName
                                        ? `${api.IMG_URL}product_images/${imgName}`
                                        : defaultImage
                                    }
                                    alt={`thumb-${index}`}
                                    className="img-fluid d-block rounded"
                                  />
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>

                      </div>
                    </Col>


                    {/* Product Details Section */}
                    <Col xl={8}>
                      <div className="mt-xl-0 mt-5">
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <h4>{isProductData.product_name}</h4>
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
                                  {formatDateTime(isProductData?.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <ProductActionButtons
                              userType={user.user_type}
                              product={isProductData}

                              onEdit={(product) => {
                                setIsProduct(product);
                                setIsUpdateModalOpen(true);
                              }}
                            />

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
                                className={classnames({ active: customActiveTab === "1" })}
                                onClick={() => toggleCustom("1")}
                              >
                                Specification
                              </NavLink>
                            </NavItem>

                            <NavItem>
                              <NavLink
                                style={{ cursor: "pointer" }}
                                className={classnames({ active: customActiveTab === "2" })}
                                onClick={() => toggleCustom("2")}
                              >
                                Details
                              </NavLink>
                            </NavItem>

                            {/* ✅ Show only when rejected */}
                            {Number(isProductData?.product_status) === 3 && (
                              <NavItem>
                                <NavLink
                                  style={{ cursor: "pointer" }}
                                  className={classnames({ active: customActiveTab === "3" })}
                                  onClick={() => toggleCustom("3")}
                                >
                                  Reject Reason
                                </NavLink>
                              </NavItem>
                            )}
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
                                      <th scope="row" style={{ width: "200px" }}>Category</th>
                                      <td>{isProductData?.category_name || "-"}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Brand</th>
                                      <td>{isProductData?.brand_name || "-"}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Color</th>
                                      <td>{isProductData?.product_color || "-"}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Material</th>
                                      <td>{isProductData?.product_material || "-"}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Weight</th>
                                      <td>{isProductData?.product_weight || "-"}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </TabPane>

                            <TabPane id="nav-detail" tabId="2">
                              <div>
                                <h5 className="font-size-16 mb-3">
                                  {isProductData?.product_name || "Product Name"}
                                </h5>

                                {isProductData?.product_description ? (
                                  <div
                                    className="product-description"
                                    dangerouslySetInnerHTML={{
                                      __html: isProductData.product_description,
                                    }}
                                  />
                                ) : (
                                  <p className="text-muted">No description available.</p>
                                )}
                              </div>
                            </TabPane>

                            {/* ✅ Reject message tab content */}
                            {Number(isProductData?.product_status) === 3 && (
                              <TabPane id="nav-reject" tabId="3">
                                <div className="bg-light rounded p-3 border">
                                  <h6 className="mb-2 text-danger">
                                    <i className="ri-error-warning-line me-1"></i>
                                    Rejected Message
                                  </h6>

                                  {isProductData?.product_reject_message ? (
                                    <p className="mb-0">{isProductData.product_reject_message}</p>
                                  ) : (
                                    <p className="text-muted mb-0">No reject reason provided.</p>
                                  )}
                                </div>
                              </TabPane>
                            )}
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