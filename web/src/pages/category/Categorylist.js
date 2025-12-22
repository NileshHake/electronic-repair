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
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { getCategoriesList, deleteCategory } from "../../store/category/index";
import CategoryAdd from "./CategoryAdd";
import CategoryUpdate from "./CategoryUpdate";
import DeleteModal from "../../Components/Common/DeleteModal";
import { api } from "../../config";
import D_img from "../../helpers/Default/D_img";



const CategoryList = () => {
  document.title = "Category List";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories } = useSelector((state) => state.CategoryReducer);

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [categoryData, setCategoryData] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // -----------------------------------
  // Fetch categories
  // -----------------------------------
  useEffect(() => {
    dispatch(getCategoriesList());
  }, [dispatch]);

  // -----------------------------------
  // Keyboard shortcuts
  // Alt+A → open add modal
  // Alt+C → close add modal
  // -----------------------------------
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

  // -----------------------------------
  // Delete handlers
  // -----------------------------------
  const onClickDelete = (cat) => {
    setSelectedCategory(cat);
    setDeleteModal(true);
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      dispatch(deleteCategory(selectedCategory.category_id));
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
                    <h5 className="mb-0 fw-bold">Category List</h5>
                  </div>
                  <div className="col-sm-auto">
                    <Button color="success" onClick={() => setIsOpen(true)}>
                      + Add Category
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
          <th style={{ width: "30%" }}>Category Name</th>
          <th style={{ width: "25%" }} className="text-center">
            Sub Category
          </th>
          <th style={{ width: "15%" }} className="text-center">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {categories && categories.length > 0 ? (
          categories.map((cat, index) => (
            <tr key={cat.category_id}>
              <td>{index + 1}</td>

              {/* Image */}
              <td className="text-center">
                {cat.category_img ? (
                  <img
                    src={`${api.IMG_URL}category_img/${cat.category_img}`}
                    alt="category"
                    className="category-img"
                  width="115px" height="115px"
                  />
                ) : (
                  <D_img width="45px" height="45px" />
                )}
              </td>

              {/* Category Name */}
              <td className="fw-semibold">{cat.category_name}</td>

              {/* Sub Category Button */}
              <td className="text-center">
                <Button
                  size="sm"
                  color="info"
                  onClick={() =>
                    navigate(`/sub-category-list/${cat.category_id}`)
                  }
                >
                  View Sub Category
                </Button>
              </td>

              {/* Actions */}
              <td className="text-center">
                <ul className="list-inline hstack gap-2 mb-0 justify-content-center">
                  <li className="list-inline-item">
                    <button
                      className="text-primary border-0 bg-transparent"
                      onClick={() => {
                        setCategoryData(cat);
                        setIsUpdateOpen(true);
                      }}
                    >
                      <i className="ri-pencil-fill fs-16"></i>
                    </button>
                  </li>

                  <li className="list-inline-item">
                    <button
                      onClick={() => onClickDelete(cat)}
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
            <td colSpan="5" className="text-center py-5">
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
      {isOpen && <CategoryAdd isOpen={isOpen} toggle={() => setIsOpen(false)} />}

      {/* Update Modal */}
      {isUpdateOpen && (
        <CategoryUpdate
          isOpen={isUpdateOpen}
          toggle={() => setIsUpdateOpen(false)}
          categoryData={categoryData}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteCategory}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default CategoryList;
