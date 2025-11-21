import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Tooltip,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Modal,
} from "reactstrap";

//Simple bar
import SimpleBar from "simplebar-react";

import { Swiper, SwiperSlide } from "swiper/react";
import classnames from "classnames";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import SwiperCore, { FreeMode, Navigation, Thumbs } from "swiper";
import { Link } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { api } from "../../config";
import ProductUpdate from "./ProductUpdate";
import { useDispatch, useSelector } from "react-redux";
import { getProductList } from "../../store/product";

SwiperCore.use([FreeMode, Navigation, Thumbs]);

const ProductReview = (props) => {
  return (
    <React.Fragment>
      <li className="py-2">
        <div className="border border-dashed rounded p-3">
          <div className="d-flex align-items-start mb-3">
            <div className="hstack gap-3">
              <div className="badge rounded-pill bg-success mb-0">
                <i className="mdi mdi-star"></i> {props.review.rating}
              </div>
              <div className="vr"></div>
              <div className="flex-grow-1">
                <p className="text-muted mb-0">{props.review.comment}</p>
              </div>
            </div>
          </div>
          {props.review.subItems && (
            <React.Fragment>
              <div className="d-flex flex-grow-1 gap-2 mb-3">
                {props.review.subItems.map((subItem, key) => (
                  <React.Fragment key={key}>
                    <Link to="#" className="d-block">
                      <img
                        src={subItem.img}
                        alt=""
                        className="avatar-sm rounded object-fit-cover"
                      />
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </React.Fragment>
          )}

          <div className="d-flex align-items-end">
            <div className="flex-grow-1">
              <h5 className="fs-14 mb-0">{props.review.name}</h5>
            </div>

            <div className="flex-shrink-0">
              <p className="text-muted fs-13 mb-0">{props.review.date}</p>
            </div>
          </div>
        </div>
      </li>
    </React.Fragment>
  );
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
        (p) => p.product_id == isProductData.product_id
      );
      setFilteredProduct(matched);
    }
  }, [filteredProduct, products]);

  const imageArray = JSON.parse(filteredProduct.product_image || "[]");
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [ttop, setttop] = useState(false);
  const [isProduct, setIsProduct] = useState({});
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [ssize, setssize] = useState(false);
  const [msize, setmsize] = useState(false);
  const [lsize, setlsize] = useState(false);
  const [xlsize, setxlsize] = useState(false);
  const [customActiveTab, setcustomActiveTab] = useState("1");
  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
  };
  document.title = "Product Details ";
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
      labelDetail: `${filteredProduct.product_tax || 0}%`,
      icon: "bx bx-calculator",
    },
    {
      label: "Purchase ",
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
      <Container fluid className="mt-4">
        <BreadCrumb title="Product Details" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Row className="gx-lg-5">
                  <Col xl={4} md={8} className="mx-auto">
                    <div className="product-img-slider sticky-side-div">
                      {/* Main Product Slider */}
                      <Swiper
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
                              <img
                                src="/default-image.jpg"
                                alt="default"
                                className="img-fluid d-block"
                              />
                            </SwiperSlide>
                          )}
                        </div>
                      </Swiper>

                      {/* Thumbnail Slider */}
                      <div className="product-nav-slider mt-3">
                        <Swiper
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
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "10px",
                                    }}
                                  />
                                </div>
                              </SwiperSlide>
                            ))
                          ) : (
                            <SwiperSlide>
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
                                  src="/default-image.jpg"
                                  alt="default"
                                  className="img-fluid d-block w-100 h-100"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                  }}
                                />
                              </div>
                            </SwiperSlide>
                          )}
                        </Swiper>
                      </div>
                    </div>
                  </Col>
                  <Col xl={8}>
                    <div className="mt-xl-0 mt-5">
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <h4>{filteredProduct.product_name}</h4>
                          <div className="hstack gap-3 flex-wrap">
                            <div className="text-muted">
                              Seller :{" "}
                              <span className="text-body fw-medium">
                                Zoetic Fashion
                              </span>
                            </div>
                            <div className="vr"></div>
                            <div className="text-muted">
                              Published :{" "}
                              <span className="text-body fw-medium">
                                26 Mar, 2021
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div>
                            <Tooltip
                              placement="top"
                              isOpen={ttop}
                              target="TooltipTop"
                              toggle={() => {
                                setttop(!ttop);
                              }}
                            >
                              Edit
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
                          </div>
                        </div>
                      </div>

                      <Row className="mt-4">
                        {productDetailsWidgets.map((pricingDetails, index) => (
                          <PricingWidgetList
                            pricingDetails={pricingDetails}
                            key={index}
                          />
                        ))}
                      </Row>
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
                                      {filteredProduct.category_name || "-"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Brand</th>
                                    <td>{filteredProduct.brand_name || "-"}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Color</th>
                                    <td>Blue</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Material</th>
                                    <td>Cotton</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Weight</th>
                                    <td>140 Gram</td>
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
