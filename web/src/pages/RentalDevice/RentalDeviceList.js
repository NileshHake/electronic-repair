import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
    Badge,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import {
    getRentalDeviceList,
    deleteRentalDevice,
} from "../../store/RentalDevice";

import RentalDeviceAdd from "./RentalDeviceAdd";
import RentalDeviceUpdate from "./RentalDeviceUpdate"; // create later if not ready
import DeleteModal from "../../Components/Common/DeleteModal";

import { api } from "../../config";
import D_img from "../../helpers/Default/D_img";

const getFirstImage = (images) => {
    if (!images) return null;

    // if backend returns JSON string
    let arr = images;
    if (typeof images === "string") {
        try {
            arr = JSON.parse(images);
        } catch (e) {
            // maybe single string filename
            arr = [images];
        }
    }

    if (Array.isArray(arr) && arr.length > 0) return arr[0];
    return null;
};

const RentalDeviceList = () => {
    document.title = "Rental Device List";

    const dispatch = useDispatch();

    const { rentalDevices = [] } = useSelector(
        (state) => state.RentalDeviceReducer
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [deviceData, setDeviceData] = useState({});
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);

    // ✅ fetch list
    useEffect(() => {
        dispatch(getRentalDeviceList());
    }, [dispatch]);

    // ✅ keyboard shortcuts
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

    // ✅ delete
    const onClickDelete = (device) => {
        setSelectedDevice(device);
        setDeleteModal(true);
    };

    const handleDeleteDevice = () => {
        if (selectedDevice) {
            dispatch(deleteRentalDevice(selectedDevice.rental_device_id));
        }
        setDeleteModal(false);
    };

    const statusBadge = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "active") return <Badge color="success">Active</Badge>;
        return <Badge color="danger">Inactive</Badge>;
    };

    return (
        <div className="page-content">
            <Container fluid>

                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="mb-0 fw-bold">Rental Device List</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <Button color="success" onClick={() => setIsOpen(true)}>
                                            + Add Rental Device
                                        </Button>
                                    </div>
                                </Row>
                            </CardHeader>

                            <CardBody className="pt-0">
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover mb-0">
                                        <thead className="table-light text-uppercase text-muted">
                                            <tr>
                                                <th style={{ width: "5%" }}>#</th>
                                                <th style={{ width: "10%" }} className="text-center">
                                                    Image
                                                </th>
                                                <th style={{ width: "20%" }}>Device</th>
                                                <th style={{ width: "15%" }} className="text-center">
                                                    Stock / Available
                                                </th>
                                                <th style={{ width: "15%" }} className="text-center">
                                                    Rent (Day)
                                                </th>
                                                <th style={{ width: "10%" }} className="text-center">
                                                    Delivery
                                                </th>
                                                <th style={{ width: "10%" }} className="text-center">
                                                    Status
                                                </th>
                                                <th style={{ width: "15%" }} className="text-center">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {rentalDevices && rentalDevices.length > 0 ? (
                                                rentalDevices.map((d, index) => {
                                                    const firstImg = getFirstImage(d.images);

                                                    // ✅ if you store image filename on server folder:
                                                    // e.g. /uploads/rental_devices/
                                                    const imgUrl = firstImg
                                                        ? firstImg.startsWith("http")
                                                            ? firstImg
                                                            : `${api.IMG_URL}rental_device_images/${firstImg}`
                                                        : null;

                                                    return (
                                                        <tr key={d.rental_device_id}>
                                                            <td>{index + 1}</td>

                                                            <td className="text-center">
                                                                {imgUrl ? (
                                                                    <img
                                                                        src={imgUrl}
                                                                        alt="device"
                                                                        className="category-img"
                                                                        width="90"
                                                                        height="90"
                                                                        style={{ objectFit: "cover", borderRadius: "8px" }}
                                                                    />
                                                                ) : (
                                                                    <D_img width="45px" height="45px" />
                                                                )}
                                                            </td>

                                                            <td>
                                                                <div className="fw-semibold">{d.device_name}</div>
                                                                <div className="text-muted" style={{ fontSize: "12px" }}>
                                                                    {d.device_category_name ? `${d.device_category_name}  ` : ""}
                                                                    <br />
                                                                    {d.device_brand_name ? `${d.device_brand_name}  ` : ""}
                                                                    <br />
                                                                    {d.device_model || ""}
                                                                </div>
                                                            </td>

                                                            <td className="text-center">
                                                                <span className="fw-semibold">{d.stock_qty ?? 0}</span>
                                                                {" / "}
                                                                <span className="text-success fw-semibold">
                                                                    {d.available_qty ?? 0}
                                                                </span>
                                                            </td>

                                                            <td className="text-center">
                                                                {d.base_rent_per_day ? `₹ ${d.base_rent_per_day}` : "-"}
                                                            </td>

                                                            <td className="text-center">
                                                                {Number(d.delivery_available) === 1 ? (
                                                                    <Badge color="info">
                                                                        Yes {d.delivery_fee ? `₹${d.delivery_fee}` : ""}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge color="secondary">No</Badge>
                                                                )}
                                                            </td>

                                                            <td className="text-center">{statusBadge(d.status)}</td>

                                                            <td className="text-center">
                                                                <ul className="list-inline hstack gap-2 mb-0 justify-content-center">
                                                                    {/* Edit */}
                                                                    <li className="list-inline-item">
                                                                        <button
                                                                            className="text-primary border-0 bg-transparent"
                                                                            onClick={() => {
                                                                                setDeviceData(d);
                                                                                setIsUpdateOpen(true);
                                                                            }}
                                                                        >
                                                                            <i className="ri-pencil-fill fs-16"></i>
                                                                        </button>
                                                                    </li>

                                                                    {/* Delete */}
                                                                    <li className="list-inline-item">
                                                                        <button
                                                                            onClick={() => onClickDelete(d)}
                                                                            className="text-danger border-0 bg-transparent"
                                                                        >
                                                                            <i className="ri-delete-bin-5-fill fs-16"></i>
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
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

            {/* ✅ Add Modal */}
            {isOpen && <RentalDeviceAdd isOpen={isOpen} toggle={() => setIsOpen(false)} />}

            {/* ✅ Update Modal */}
            {isUpdateOpen && (
                <RentalDeviceUpdate
                    isOpen={isUpdateOpen}
                    toggle={() => setIsUpdateOpen(false)}
                    deviceData={deviceData}
                />
            )}

            {/* ✅ Delete Modal */}
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDeleteDevice}
                onCloseClick={() => setDeleteModal(false)}
            />
        </div>
    );
};

export default RentalDeviceList;