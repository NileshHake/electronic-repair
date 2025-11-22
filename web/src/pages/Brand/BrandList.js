import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import DeleteModal from "../../Components/Common/DeleteModal";
import { ToastContainer } from "react-toastify";
import { deleteBrand, getBrandsList } from "../../store/Brand";
import BrandUpdate from "./BrandUpdate";
import BrandAdd from "./BrandAdd";

const BrandList = () => {
  document.title = "Brand";

  const dispatch = useDispatch();
  const { brands } = useSelector((state) => state.BrandReducer);

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [brandData, setBrandData] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    dispatch(getBrandsList());
  }, [dispatch]);

  // ALT + A opens add modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Delete handlers
  const onClickDelete = (brand) => {
    setSelectedBrand(brand);
    setDeleteModal(true);
  };

  const handleDeleteBrand = () => {
    if (selectedBrand) {
      dispatch(deleteBrand(selectedBrand.brand_id));
    }
    setDeleteModal(false);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer closeButton={false} limit={1} autoClose={100} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="mb-0 fw-bold">Brand List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsOpen(true)}>
                      + Add Brand
                    </Button>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th style={{ width: "5%" }}>#</th>
                        <th style={{ width: "65%" }}>Brand Name</th>
                        <th style={{ width: "30%" }}>Actions</th>
                      </tr>
                    </thead>
                   <tbody>
  {brands && brands.length > 0 ? (
    brands.map((brand, index) => (
      <tr key={brand.brand_id}>
        <td>{index + 1}</td>
        <td>{brand.brand_name}</td>
        <td>
          <ul className="list-inline hstack gap-2 mb-0">
            <li className="list-inline-item">
              <button
                className="text-primary border-0 bg-transparent"
                onClick={() => {
                  setBrandData(brand);
                  setIsUpdateOpen(true);
                }}
              >
                <i className="ri-pencil-fill fs-16"></i>
              </button>
            </li>
            <li className="list-inline-item">
              <button
                onClick={() => onClickDelete(brand)}
                className="text-danger border-0 bg-transparent"
              >
                <i className="ri-delete-bin-5-fill fs-16"></i>
              </button>
            </li>
          </ul>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" className="text-center py-5">
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
  )}
</tbody>

                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add Modal */}
      {isOpen && <BrandAdd isOpen={isOpen} toggle={() => setIsOpen(false)} />}

      {/* Update Modal */}
      {isUpdateOpen && (
        <BrandUpdate
          isOpen={isUpdateOpen}
          toggle={() => setIsUpdateOpen(false)}
          brandData={brandData}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteBrand}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default BrandList;
