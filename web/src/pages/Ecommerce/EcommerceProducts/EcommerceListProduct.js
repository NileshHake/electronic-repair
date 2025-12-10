import React, { useEffect, useState, useMemo } from "react";
import {
    Container,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownItem,
    DropdownMenu,
    Nav,
    NavItem,
    NavLink,
    UncontrolledCollapse,
    Row,
    Card,
    CardHeader,
    Col,
    Button,
    Input,
    Label,
} from "reactstrap";
import classnames from "classnames";
import { toast, ToastContainer } from 'react-toastify';
import Select from "react-select"
// RangeSlider
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import DeleteModal from "../../../Components/Common/DeleteModal";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import { Rating, Published, Price } from "./EcommerceProductCol";
import { useDispatch, useSelector } from "react-redux";
import { getCategoriesList } from "../../../store/category";
import { getBrandsList } from "../../../store/Brand";
import { Link } from "feather-icons-react/build/IconComponents";
import { filterProductForSale } from "../../../store/product";
import ProductSaleCard from "./Component/ProductSaleCard";
import ProductView from "../../Product/ProductView";
import { max } from "moment";



const EcommerceProducts = (props) => {
    const dispatch = useDispatch();
    const filterProducts = useSelector((state) => state.ProductReducer.filterProductsforSale);
    const max_price = useSelector((state) => state.ProductReducer.max_price) || 0;
    const min_price = useSelector((state) => state.ProductReducer.min_price) || 0;

    const [filterData, setFilterData] = useState({
        product_search: "",
        minPrice: min_price ,
        maxPrice: max_price  ,
        categoryId: 0,
        brandIds: [],

    });
    // ***** NEW states *****
    const [startMin, setStartMin] = useState(0);
    const [startMax, setStartMax] = useState(0);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isProduct, setIsProduct] = useState({});



    const { categories } = useSelector((state) => state.CategoryReducer);
    const [selectedBrands, setSelectedBrands] = useState([]);

    const { brands } = useSelector((state) => state.BrandReducer);
    useEffect(() => {
        dispatch(getCategoriesList());
        dispatch(getBrandsList());
        if (filterData) {
            dispatch(filterProductForSale(filterData))
        }
    }, [dispatch, filterData]);
    useEffect(() => {
        if (min_price !== undefined && max_price !== undefined) {
            setStartMin(min_price);
            setStartMax(max_price);

            setFilterData(prev => ({
                ...prev,
                minPrice: min_price,
                maxPrice: max_price
            }));
        }
    }, [min_price, max_price]);
    const handleCategoryChange = (cat) => {
        setFilterData(prev => ({
            ...prev,
            categoryId: cat.category_id
        }));
    };

    const handleBrandChange = (brd) => {
        const currentBrandIds = filterData.brandIds || []; // fallback to empty array
        let updated;

        if (currentBrandIds.includes(brd.brand_id)) {
            updated = currentBrandIds.filter(id => id !== brd.brand_id);
        } else {
            updated = [...currentBrandIds, brd.brand_id];
        }

        setSelectedBrands(updated);

        setFilterData(prev => ({
            ...prev,
            brandIds: updated
        }));
    };

    const onUpdate = (values) => {
        setFilterData(prev => ({
            ...prev,
            minPrice: Number(values[0]),
            maxPrice: Number(values[1])
        }));
    };
    document.title = "Products | List ";

    return (
        <div className="page-content">

            <ToastContainer closeButton={false} limit={1} />

            <Container fluid>
                <BreadCrumb title="Products" pageTitle="Ecommerce" />
                <Row>
                    <Col xl={3} lg={4}>
                        <Card>
                            <CardHeader >
                                <div className="d-flex mb-3">
                                    <div className="flex-grow-1">
                                        <h5 className="fs-16">Filters</h5>
                                    </div>
                                    <button
                                        className="btn btn-link p-0 text-decoration-underline"
                                        onClick={() =>
                                            setFilterData({
                                                product_search: "",
                                                minPrice: 0,
                                                maxPrice: 2000,
                                                categoryIds: [],
                                                brandIds: [],
                                            })
                                        }
                                    >
                                        Clear All
                                    </button>

                                </div>


                            </CardHeader>

                            <div className="accordion accordion-flush">
                                <div className="accordion-item  p-3 ">
                                    <Label>Search By Name</Label>
                                    <Input
                                        className="form-control "
                                        placeholder="Search By Name "
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            setFilterData(prev => ({
                                                ...prev,
                                                product_search: value
                                            }));
                                        }}

                                    /></div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button
                                            className="accordion-button bg-transparent shadow-none"
                                            type="button"
                                            id="flush-headingCategory"
                                        >
                                            <span className="text-muted text-uppercase fs-12 fw-medium">
                                                Category
                                            </span>
                                            <span className="badge bg-success rounded-pill align-middle ms-1">
                                                {categories?.length}
                                            </span>
                                        </button>
                                    </h2>

                                    <UncontrolledCollapse toggler="#flush-headingCategory" defaultOpen>
                                        <ul className="list-unstyled mb-0 filter-list ps-4">
                                            {categories?.map((cat) => (
                                                <li key={cat.category_id} className="d-flex align-items-center py-1">

                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input me-2"
                                                        checked={filterData.categoryId === cat.category_id}
                                                        onChange={() => handleCategoryChange(cat)}
                                                    />

                                                    <label className="form-check-label fs-13 listname">
                                                        {cat.category_name}
                                                    </label>

                                                </li>
                                            ))}
                                        </ul>

                                    </UncontrolledCollapse>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button
                                            className="accordion-button bg-transparent shadow-none"
                                            type="button"
                                            id="flush-headingBrand"
                                        >
                                            <span className="text-muted text-uppercase fs-12 fw-medium">
                                                Brand
                                            </span>
                                            <span className="badge bg-success rounded-pill align-middle ms-1">
                                                {brands?.length}
                                            </span>
                                        </button>
                                    </h2>

                                    <UncontrolledCollapse toggler="#flush-headingBrand">
                                        <ul className="list-unstyled mb-0 filter-list ps-4">
                                            {brands?.map((brd) => (
                                                <li key={brd.brand_id} className="d-flex align-items-center py-1">

                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input me-2"
                                                        checked={filterData.brandIds.includes(brd.brand_id)}
                                                        onChange={() => handleBrandChange(brd)}
                                                    />

                                                    <label className="form-check-label fs-13 listname">
                                                        {brd.brand_name}
                                                    </label>

                                                </li>
                                            ))}
                                        </ul>
                                    </UncontrolledCollapse>

                                </div>
                                <div className="card-body border-bottom">
                                    <p className="text-muted text-uppercase fs-12 fw-medium mb-4">
                                        Price
                                    </p>

                                    {min_price !== undefined && max_price !== undefined && (
                                        <Nouislider
                                            range={{ min: min_price, max: max_price + 1 }}
                                            start={[startMin, startMax]}
                                            connect
                                            onSlide={onUpdate}
                                        />
                                    )}


                                    <div className="d-flex justify-content-between mt-2">
                                        <span>₹{filterData.minPrice}</span>
                                        <span>₹{filterData.maxPrice}</span>
                                    </div>
                                </div>




                            </div>
                        </Card>
                    </Col>

                    <div className="col-xl-9 col-lg-8 bg-white">
                        <div className="card-body">
                            <Row className="g-4">
                                {filterProducts && filterProducts.length > 0 ? (
                                    filterProducts.map((product) => (
                                        <Col key={product.product_id} md={6} xl={4}>
                                            <ProductSaleCard
                                                product={product}
                                                onViewDetails={() => {
                                                    // Your logic to set modal data and open the modal
                                                    setIsProduct(product);
                                                    setIsViewModalOpen(true);
                                                }}
                                                onAddToCart={(prod) => console.log('Added to cart:', prod)}
                                            />
                                        </Col>
                                    ))
                                ) : (
                                    <div className="d-flex flex-column justify-content-center align-items-center w-100 my-5 text-center">
                                        <lord-icon
                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                            trigger="loop"
                                            colors="primary:#405189,secondary:#0ab39c"
                                            style={{ width: "80px", height: "80px" }}
                                        ></lord-icon>

                                        <h5 className="mt-3 text-muted">Sorry! No Result Found</h5>
                                    </div>

                                )}
                            </Row>
                        </div>
                    </div>
                </Row>
            </Container>

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

export default EcommerceProducts;