import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Button,
  Col,
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import DeleteModal from "../../Components/Common/DeleteModal";
import ProductAdd from "./ProductAdd";
import ProductUpdate from "./ProductUpdate"; 
import {
  deleteProduct,
  getProductList,
  resetAddProductResponse,
} from "../../store/product";
import AuthUser from "../../helpers/AuthType/AuthUser";
import ProductView from "./ProductView";

const ProductList = () => {
  const dispatch = useDispatch();
  const { permissions } = AuthUser();

  const products = useSelector((state) => state.ProductReducer.products);

  const [isProduct, setIsProduct] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getProductList());
    dispatch(resetAddProductResponse());
  }, [dispatch]);

  const onClickDelete = (product) => {
    setIsProduct(product);
    setDeleteModal(true);
  };

  const handleDeleteProduct = () => {
    dispatch(deleteProduct(isProduct.product_id));
    setDeleteModal(false);
  };

  document.title = "Products List";
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsModalOpen(true);
      }
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} autoClose={100} />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteProduct}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        <Row className="align-items-center gy-3">
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0 d-flex justify-content-between">
                <div className="col-sm">
                  <h4 className="mb-0">Product List</h4>
                </div>
                <div className="col-sm-auto">

                  {permissions.find(
                    (permission) =>
                      permission.permission_category == "PRODUCT" &&
                      permission.permission_path == "2"
                  ) && (
                      <Button
                        color="success"
                        onClick={() => setIsModalOpen(true)}
                      >
                        + Add Product
                      </Button>
                    )}
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="col-xl-12 col-lg-12">
                  <div className="card">
                    <div className="card-body pt-0">
                      <div className="table-responsive">
                        <table
                          role="table"
                          className="align-middle table-nowrap table table-hover"
                        >
                          <thead className="table-light text-muted text-uppercase text-center">
                            <tr>
                              <th>Sr No</th>
                              <th>Product Name</th>
                              <th>Category</th>
                              <th>Brand</th>
                              <th>Tax Name</th>
                              <th>Tax (%)</th>
                              <th>Purchase Price</th>
                              <th>Sale Price</th>
                              <th>MRP</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          {permissions.find(
                            (permission) =>
                              permission.permission_category === "PRODUCT" &&
                              permission.permission_path === "1"
                          ) &&
                            products &&
                            products.length > 0 ? (
                            <tbody>
                              {products.map((item, index) => {


                                const canUpdate = permissions.some(
                                  (p) =>
                                    p.permission_category === "PRODUCT" &&
                                    p.permission_path === "3"
                                );
                                const canDelete = permissions.some(
                                  (p) =>
                                    p.permission_category === "PRODUCT" &&
                                    p.permission_path === "4"
                                );

                                return (
                                  <tr key={index} className="text-center">
                                    <td>{index + 1}</td>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                          <h6 className="mb-0">
                                            {item.product_name}
                                          </h6>
                                        </div>
                                      </div>
                                    </td>
                                    <td>{item.category_name || "N/A"}</td>
                                    <td>{item.brand_name || "N/A"}</td>
                                    <td>{item.tax_name || ""}</td>
                                    <td>{item.tax_percentage || "0"}%</td>
                                    <td>₹{item.product_purchase_price}</td>
                                    <td>₹{item.product_sale_price}</td>
                                    <td>₹{item.product_mrp}</td>
                                    <td className="text-center">
                                      <ul className="list-inline hstack   mb-0">
                                        <li className="list-inline-item edit">
                                          <button
                                            className="text-primary d-inline-block edit-item-btn border-0 bg-transparent"
                                            onClick={() => {
                                              setIsProduct(item);
                                              setIsViewModalOpen(true);
                                            }}
                                          >
                                            <i className="ri-eye-fill fs-16" />
                                          </button>
                                        </li>
                                        {canUpdate && (
                                          <li className="list-inline-item">
                                            <button
                                              className="text-primary border-0 bg-transparent"
                                              onClick={() => {
                                                setIsProduct(item);
                                                setIsUpdateModalOpen(true);
                                              }}
                                            >
                                              <i className="ri-pencil-fill fs-16"></i>
                                            </button>
                                          </li>
                                        )}
                                        {canDelete && (
                                          <li className="list-inline-item">
                                            <button
                                              onClick={() =>
                                                onClickDelete(item)
                                              }
                                              className="text-danger border-0 bg-transparent"
                                            >
                                              <i className="ri-delete-bin-5-fill fs-16"></i>
                                            </button>
                                          </li>
                                        )}
                                      </ul>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          ) : (
                            <tbody>
                              <tr>
                                <td colSpan="9" className="text-center py-5">
                                  <lord-icon
                                    src="https://cdn.lordicon.com/msoeawqm.json"
                                    trigger="loop"
                                    colors="primary:#405189,secondary:#0ab39c"
                                    style={{ width: "72px", height: "72px" }}
                                  ></lord-icon>
                                  <div className="mt-4">
                                    <h5>Sorry! No Result Found</h5>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          )}
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Product Add Modal */}
      {isModalOpen && (
        <ProductAdd isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} />
      )}

      {/* Product Update Modal */}
      {isUpdateModalOpen && (
        <ProductUpdate
          isOpen={isUpdateModalOpen}
          toggle={() => setIsUpdateModalOpen(false)}
          isProductData={isProduct}
        />
      )}
        {isViewModalOpen && (
          <ProductView
            isOpen={isViewModalOpen}
            toggle={() => setIsViewModalOpen(false)}
            isProductData={isProduct}
          />
        )}
    </div>
  );
};

export default ProductList;
