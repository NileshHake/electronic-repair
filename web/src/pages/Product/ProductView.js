import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
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
import { useSelector } from "react-redux";
import AuthUser from "../../helpers/AuthType/AuthUser";
import { formatDateTime } from "../../helpers/date_and_time_format";
import defaultImage from "../../assets/images/productdefaultimg/istockphoto-1396814518-612x612.jpg";
import ProductActionButtons from "./component/ProductActionButtons";

const toText = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));
const toYesNo = (v) => (v === true || v === 1 || v === "1" ? "Yes" : "No");

const money = (v) => {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

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

function ProductView(props) {
  const { BusinessData, user } = AuthUser();
  const { isProductData } = props;

  const imageArray = (() => {
    try {
      const x = JSON.parse(isProductData?.product_image || "[]");
      return Array.isArray(x) ? x : [];
    } catch {
      return [];
    }
  })();

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isProduct, setIsProduct] = useState({});
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [customActiveTab, setcustomActiveTab] = useState("1");

  const updateProductResponse = useSelector(
    (state) => state.ProductReducer.updateProductResponse
  );

  useEffect(() => {
    document.title = "Product Details";
  }, []);

  useEffect(() => {
    if (updateProductResponse === true) {
      props.toggle();
    }
  }, [updateProductResponse]);

  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) setcustomActiveTab(tab);
  };

  const productDetailsWidgets = [
    {
      label: "MRP",
      labelDetail: `₹ ${money(isProductData?.product_mrp)}`,
      icon: "bx bx-rupee",
    },
    {
      label: "Sale Price",
      labelDetail: `₹ ${money(isProductData?.product_sale_price)}`,
      icon: "bx bx-purchase-tag",
    },
    {
      label: "Tax",
      labelDetail: `${Number(isProductData?.tax_percentage ?? isProductData?.product_tax ?? 0)}%`,
      icon: "bx bx-calculator",
    },
    {
      label: "Purchase",
      labelDetail: `₹ ${money(isProductData?.product_purchase_price)}`,
      icon: "bx bx-cart",
    },
  ];

  const statusLabel = (s) => {
    const n = Number(s);
    if (n === 1) return "Pending";
    if (n === 2) return "Approved";
    if (n === 3) return "Rejected";
    return toText(s);
  };

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={props.toggle}
      centered
      scrollable
      id="exampleModalScrollable"
      size="xl"
      className="modal-dialog-scrollable"
    >
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
                    {/* LEFT: Images */}
                    <Col xl={4} md={8} className="mx-auto">
                      <div className="product-img-slider sticky-side-div">
                        <Swiper
                          modules={[Navigation, Thumbs]}
                          navigation
                          thumbs={{
                            swiper:
                              thumbsSwiper && !thumbsSwiper.destroyed
                                ? thumbsSwiper
                                : null,
                          }}
                          className="swiper product-thumbnail-slider p-2 rounded bg-light"
                        >
                          {(imageArray?.length ? imageArray : [null]).map(
                            (imgName, index) => (
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
                            )
                          )}
                        </Swiper>

                        <div className="product-nav-slider mt-2">
                          <Swiper
                            modules={[FreeMode, Thumbs]}
                            onSwiper={setThumbsSwiper}
                            slidesPerView={4}
                            freeMode
                            watchSlidesProgress
                            spaceBetween={10}
                            className="swiper product-nav-slider mt-2 overflow-hidden"
                          >
                            {(imageArray?.length ? imageArray : [null]).map(
                              (imgName, index) => (
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
                              )
                            )}
                          </Swiper>
                        </div>
                      </div>
                    </Col>

                    {/* RIGHT: Details */}
                    <Col xl={8}>
                      <div className="mt-xl-0 mt-5">
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <h4>{toText(isProductData?.product_name)}</h4>
                            <div className="hstack gap-3 flex-wrap">
                              <div className="text-muted">
                                Seller :{" "}
                                <span className="text-body fw-medium">
                                  {toText(BusinessData?.user_name)}
                                </span>
                              </div>
                              <div className="vr"></div>
                              <div className="text-muted">
                                Published :{" "}
                                <span className="text-body fw-medium">
                                  {isProductData?.createdAt
                                    ? formatDateTime(isProductData?.createdAt)
                                    : "-"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <ProductActionButtons
                              userType={user?.user_type}
                              product={isProductData}
                              onEdit={(product) => {
                                setIsProduct(product);
                                setIsUpdateModalOpen(true);
                              }}
                            />
                          </div>
                        </div>

                        {/* Widgets */}
                        <Row className="mt-4">
                          {productDetailsWidgets
                            .filter((temp) =>
                              user?.user_type == 6
                                ? temp.label !== "Purchase"
                                : true
                            )
                            .map((pricingDetails, index) => (
                              <PricingWidgetList
                                pricingDetails={pricingDetails}
                                key={index}
                              />
                            ))}
                        </Row>

                        {/* Tabs */}
                        <div className="product-content mt-5">
                          <h5 className="fs-14 mb-3">Product Info :</h5>

                          <Nav tabs className="nav-tabs-custom nav-success">
                            <NavItem>
                              <NavLink
                                style={{ cursor: "pointer" }}
                                className={classnames({
                                  active: customActiveTab === "1",
                                })}
                                onClick={() => toggleCustom("1")}
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
                                onClick={() => toggleCustom("2")}
                              >
                                Details
                              </NavLink>
                            </NavItem>

                            {Number(isProductData?.product_status) === 3 && (
                              <NavItem>
                                <NavLink
                                  style={{ cursor: "pointer" }}
                                  className={classnames({
                                    active: customActiveTab === "3",
                                  })}
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
                            {/* SPECIFICATION */}
                            <TabPane id="nav-speci" tabId="1">
                              <div className="table-responsive">
                                <table className="table mb-0">
                                  <tbody>
                                    <tr>
                                      <th scope="row" style={{ width: 220 }}>Category</th>
                                      <td>{toText(isProductData?.category_name)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Sub Category</th>
                                      <td>{toText(isProductData?.sub_category_name)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Brand</th>
                                      <td>{toText(isProductData?.brand_name)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Usage Type</th>
                                      <td>{toText(isProductData?.product_usage_type)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">HSN Code</th>
                                      <td>{toText(isProductData?.product_hsn_code)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Tax (%)</th>
                                      <td>
                                        {Number(isProductData?.tax_percentage ?? isProductData?.product_tax ?? 0)}%
                                      </td>
                                    </tr>

                                    {/* ✅ DVR / NVR Channel */}
                                    {Number(isProductData?.product_category) === 13 &&
                                      [14, 15].includes(Number(isProductData?.product_sub_category)) && (
                                        <tr>
                                          <th scope="row">DVR/NVR Channel</th>
                                          <td>{toText(isProductData?.product_dvr_or_nvr_channel)}</td>
                                        </tr>
                                      )}



                                    {Number(isProductData?.product_category) == 1 && <tr>
                                      <th scope="row">Generation</th>
                                      <td>{toText(isProductData?.generation_name)}</td>
                                    </tr>}

                                    {/* ✅ RAM + Support Generations only for category 2 */}
                                    {Number(isProductData?.product_category) === 2 && (
                                      <>
                                        <tr>
                                          <th scope="row">RAM</th>
                                          <td>{toText(isProductData?.ram_name)}</td>
                                        </tr>

                                        <tr>
                                          <th scope="row">Support Generations</th>
                                          <td>{toText(isProductData?.generations_names)}</td>
                                        </tr>
                                      </>
                                    )}

                                    <tr>
                                      <th scope="row">Color</th>
                                      <td>{toText(isProductData?.product_color)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Material</th>
                                      <td>{toText(isProductData?.product_material)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Weight</th>
                                      <td>{toText(isProductData?.product_weight)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">On Sale</th>
                                      <td>{toYesNo(isProductData?.product_on_sale)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Discount Amount</th>
                                      <td>{toText(isProductData?.product_discount_amount)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Discount Percent</th>
                                      <td>{toText(isProductData?.product_discount_percent)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Free Delivery</th>
                                      <td>{toYesNo(isProductData?.product_on_free_delivery)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Delivery Charge</th>
                                      <td>{toText(isProductData?.product_delivery_charge)}</td>
                                    </tr>

                                    <tr>
                                      <th scope="row">Status</th>
                                      <td>{statusLabel(isProductData?.product_status)}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </TabPane>

                            {/* DETAILS */}
                            <TabPane id="nav-detail" tabId="2">
                              <div>
                                <h5 className="font-size-16 mb-3">
                                  {toText(isProductData?.product_name)}
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

                            {/* REJECT */}
                            {Number(isProductData?.product_status) === 3 && (
                              <TabPane id="nav-reject" tabId="3">
                                <div className="bg-light rounded p-3 border">
                                  <h6 className="mb-2 text-danger">
                                    <i className="ri-error-warning-line me-1"></i>
                                    Rejected Message
                                  </h6>

                                  {isProductData?.product_reject_message ? (
                                    <p className="mb-0">
                                      {isProductData.product_reject_message}
                                    </p>
                                  ) : (
                                    <p className="text-muted mb-0">
                                      No reject reason provided.
                                    </p>
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