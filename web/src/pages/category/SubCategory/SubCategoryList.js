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
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import SubCategoryAdd from "./SubCategoryAdd";
import SubCategoryUpdate from "./SubCategoryUpdate";
import { deleteCategory, getSubCategoriesList } from "../../../store/category";
import DeleteModal from "../../../Components/Common/DeleteModal";

const SubCategoryList = () => {
    document.title = "Sub Category List";

    const dispatch = useDispatch();
    const { category_id } = useParams(); // main category id

    const { subCategories, addCategoryResponse, updateCategoryResponse } = useSelector(
        (state) => state.CategoryReducer
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [subCategoryData, setSubCategoryData] = useState({});
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);

    // Fetch Sub Categories by Main Category ID
    useEffect(() => {

        if (category_id) {
            dispatch(getSubCategoriesList(category_id));
        }
    }, [dispatch, category_id, addCategoryResponse, updateCategoryResponse]);

    // Delete handlers
    const onClickDelete = (subCat) => {
        setSelectedSubCategory(subCat);
        setDeleteModal(true);
    };

    const handleDeleteSubCategory = () => {
        if (selectedSubCategory) {
            dispatch(deleteCategory(selectedSubCategory.category_id));
            // Refresh after deletion
            setTimeout(() => dispatch(getSubCategoriesList(category_id)), 500);
        }
        setDeleteModal(false);
    };
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.altKey && event.key.toLowerCase() === "a" || event.altKey && event.key.toLowerCase() === "A") {
                event.preventDefault();
                setIsOpen(true); // Open Add Modal
            }
            if (event.altKey && event.key.toLowerCase() === "c" || event.altKey && event.key.toLowerCase() === "C") {
                event.preventDefault();
                setIsOpen(false); // Close Add Modal
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    return (
        <div className="page-content">
            <Container fluid>
                <ToastContainer closeButton={false} limit={1} autoClose={100} />

                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardHeader className="border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="mb-0 fw-bold">Sub Category List</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <Button color="success" onClick={() => setIsOpen(true)}>
                                            + Add Sub Category
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
                                                <th style={{ width: "60%" }}>Sub Category Name</th>
                                                <th style={{ width: "15%" }} className="text-center">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {subCategories && subCategories.length > 0 ? (
                                                subCategories.map((subCat, index) => (
                                                    <tr key={subCat.category_id}>
                                                        <td>{index + 1}</td>
                                                        <td className="fw-semibold">{subCat.category_name}</td>
                                                        <td className="text-center">
                                                            <ul className="list-inline hstack gap-2 mb-0 justify-content-center">
                                                                <li className="list-inline-item">
                                                                    <button
                                                                        className="text-primary border-0 bg-transparent"
                                                                        onClick={() => {
                                                                            setSubCategoryData(subCat);
                                                                            setIsUpdateOpen(true);
                                                                        }}
                                                                    >
                                                                        <i className="ri-pencil-fill fs-16"></i>
                                                                    </button>
                                                                </li>

                                                                <li className="list-inline-item">
                                                                    <button
                                                                        onClick={() => onClickDelete(subCat)}
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
                                                    <td colSpan="4" className="text-center py-5">
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
            {isOpen && (
                <SubCategoryAdd
                    isOpen={isOpen}
                    toggle={() => setIsOpen(false)}
                    category_id={category_id}
                />
            )}

            {/* Update Modal */}
            {isUpdateOpen && (
                <SubCategoryUpdate
                    isOpen={isUpdateOpen}
                    toggle={() => setIsUpdateOpen(false)}
                    subCategoryData={subCategoryData}
                    category_id={category_id}
                />
            )}

            {/* Delete Modal */}
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDeleteSubCategory}
                onCloseClick={() => setDeleteModal(false)}
            />
        </div>
    );
};

export default SubCategoryList;
