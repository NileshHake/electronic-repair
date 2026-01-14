// src/views/addresses/CustomerAddressList.js
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
import { ToastContainer } from "react-toastify";

import DeleteModal from "../../Components/Common/DeleteModal";
import CustomerAddressAdd from "./CustomerAddressAdd";
import CustomerAddressUpdate from "./CustomerAddressUpdate";
import {
  deleteCustomerAddress,
  getCustomerAddressList,
  resetAddCustomerAddressResponse,
  resetUpdateCustomerAddressResponse,
} from "../../store/CustomerAddress";

const CustomerAddressList = () => {
  document.title = "Customer Address List";

  const dispatch = useDispatch();

  // safe selector access — get the slice; fallback to {}
  const addressSlice =
    useSelector((state) => state.CustomerAddressReducer) || {};
  const {
    customerAddressList = [],
    loading = false,
    addCustomerAddressResponse = false,
    updateCustomerAddressResponse = false,
  } = addressSlice;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // initial fetch
  useEffect(() => {
    dispatch(getCustomerAddressList());
  }, [dispatch]);

  // refresh list after add/update success flags
  useEffect(() => {
    if (addCustomerAddressResponse) {
      dispatch(getCustomerAddressList());
      dispatch(resetAddCustomerAddressResponse());
      setIsAddOpen(false);
    }
    if (updateCustomerAddressResponse) {
      dispatch(getCustomerAddressList());
      dispatch(resetUpdateCustomerAddressResponse());
      setIsUpdateOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addCustomerAddressResponse, updateCustomerAddressResponse]);

  // Delete
  const onClickDelete = (address) => {
    setSelectedAddress(address);
    setDeleteModal(true);
  };

  const handleDeleteAddress = () => {
    if (selectedAddress) {
      dispatch(deleteCustomerAddress(selectedAddress. customer_address_id));
    }
    setDeleteModal(false);
  };

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setIsAddOpen(true);
      }
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setIsAddOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <ToastContainer closeButton={false} limit={1} autoClose={800} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="mb-0 fw-bold">Customer Address List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsAddOpen(true)}>
                      + Add Customer Address
                    </Button>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light text-uppercase text-muted">
                      <tr>
                        <th>#</th>
                        <th>City / Village</th>
                        <th>District</th>
                        <th>State</th>
                        <th>Block</th>
                        <th>Pincode</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
               <tbody>
  {!loading && customerAddressList?.length > 0 ? (
    customerAddressList.map((address, index) => (
      <tr key={address.customer_address_id || index}>
        <td>{index + 1}</td>
        <td>{address.customer_address_city}</td>
        <td>{address.customer_address_district}</td>
        <td>{address.customer_address_state}</td>
        <td>{address.customer_address_block}</td>
        <td>{address.customer_address_pincode}</td>
        <td>
          <div
            dangerouslySetInnerHTML={{
              __html: address.customer_address_description || "—",
            }}
          />
        </td>
        <td>
          <ul className="list-inline hstack gap-2 mb-0">
            <li className="list-inline-item">
              <button
                className="text-primary border-0 bg-transparent"
                onClick={() => {
                  setSelectedAddress(address);
                  setIsUpdateOpen(true);
                }}
              >
                <i className="ri-pencil-fill fs-16"></i>
              </button>
            </li>
            <li className="list-inline-item">
              <button
                className="text-danger border-0 bg-transparent"
                onClick={() => onClickDelete(address)}
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
      <td colSpan="8" className="text-center py-5">
        <lord-icon
          src="https://cdn.lordicon.com/msoeawqm.json"
          trigger="loop"
          colors="primary:#405189,secondary:#0ab39c"
          style={{ width: "72px", height: "72px" }}
        ></lord-icon>
        <div className="mt-4">
          <h5>Sorry! No Customer Addresses Found</h5>
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
      {isAddOpen && (
        <CustomerAddressAdd
          isOpen={isAddOpen}
          toggle={() => setIsAddOpen(false)}
        />
      )}

      {/* Update Modal */}
      {isUpdateOpen && (
        <CustomerAddressUpdate
          isOpen={isUpdateOpen}
          toggle={() => setIsUpdateOpen(false)}
          editData={selectedAddress}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteAddress}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default CustomerAddressList;
