import React from 'react';
import {
    Card,
    CardBody,
    CardImg,
    Button,
    Badge,
    Row,
    Col
} from 'reactstrap';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import defaultImage from "../../../../assets/images/productdefaultimg/istockphoto-1396814518-612x612.jpg"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper'; // Import modules from 'swiper' 
import { api } from '../../../../config';
import { addToCart } from '../../../../store/AddToCart';
import { useDispatch } from 'react-redux';


/**
 * Product Card Component for Sale View
 * @param {object} props
 * @param {object} props.product - The product object to display.
 * @param {function} props.onViewDetails - Handler function for view details action.
 * @param {function} props.onAddToCart - Handler function for add to cart action.
 */
const ProductSaleCard = ({ product, onViewDetails }) => {
    const dispatch = useDispatch()
    const imageArray = JSON.parse(product.product_image || "[]");

    const imagesToDisplay = imageArray.length > 0
        ? imageArray.map(imgName => api.IMG_URL + "product_images/" + imgName)
        : [defaultImage];


    const onAddToCart = (product) => {
        const addtocarddata = {
            add_to_card_product_id: product.product_id,
            add_to_card_product_qty: 1,
            add_to_card_product_sale_price: product.product_sale_price,
            add_to_card_product_mrp: product.product_mrp,
            add_to_card_product_name: product.product_name,
            add_to_card_product_discount: product.product_dis
        }
        dispatch(addToCart(addtocarddata));
    }

    return (
        <Card className="product-sale-card h-100 shadow-sm border-0">
            {/* Image Slider Section */}
            <div className="product-img-group position-relative">
                <Swiper
                    pagination={{ type: "progressbar" }}
                    navigation={true}
                    modules={[Pagination, Navigation, Autoplay]}
                    loop={true}
                    Autoplay={{ delay: 2500, disableOnInteraction: false }}
                    className="mySwiper swiper pagination-progress-swiper rounded-top"
                >
                    {imagesToDisplay.map((imgSrc, index) => (
                        <SwiperSlide key={index}>
                            <CardImg
                                top
                                width="100%"
                                src={imgSrc}
                                alt={`${product.product_name} image ${index + 1}`}
                                className="img-fluid"
                                style={{ maxHeight: '200px', objectFit: 'cover' }}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Sale Badge */}
                {/* {isNew && (
                    <Badge color="danger" className="position-absolute top-0 start-0 m-2">
                        New
                    </Badge>
                )} */}
            </div>

            {/* Product Details Section */}
            <CardBody className="text-center p-3">
                <div className="product-details-wrap mb-3">
                    <h5 className="fs-16 text-truncate mb-1">
                        <a href="#!" className="text-dark">
                            {product.product_name}
                        </a>
                    </h5>
                    <p className="text-muted mb-2">{product.category_name || "Uncategorized"}</p>

                    {/* Price and Rating */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        {/* Rating Display */}
                        {/* <div className="product-rating">
                            <i className="mdi mdi-star text-warning me-1"></i>
                            <span className="text-muted">{rating}</span>
                        </div> */}

                        {/* Price Display */}
                        <div className="product-price">
                            <span className="text-primary fs-18 fw-bold">
                                ₹{product.product_sale_price}
                            </span>
                            {product.product_mrp && product.product_mrp > product.product_sale_price && (
                                <del className="text-muted ms-2 fs-14">
                                    ₹{product.product_mrp}
                                </del>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <Row className="g-2">
                    <Col xs={6}>
                        <Button
                            color="primary"
                            className="w-100"
                            onClick={() => onViewDetails(product)}
                        >
                            <i className="ri-eye-line align-bottom me-1"></i> View
                        </Button>
                    </Col>
                    <Col xs={6}>
                        <Button
                            color="success"
                            className="w-100"
                            onClick={() => onAddToCart(product)}
                        >
                            <i className="ri-shopping-cart-line align-bottom me-1"></i> Add
                        </Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    );

}
export default ProductSaleCard;

//