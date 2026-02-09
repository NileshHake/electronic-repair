import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, resetAddProductResponse } from "../../../store/product/index";

export const useProductForm = ({ toggle }) => {
    const dispatch = useDispatch();
    const addProductResponse = useSelector((s) => s.ProductReducer.addProductResponse);

    const [activeTab, setActiveTab] = useState("1");
    const [errorMessage, setErrorMessage] = useState({});

    const [productData, setProductData] = useState({
        product_name: "",
        product_category: "",
        product_usage_type: "sale",
        product_tax: "",
        product_brand: "",
        product_mrp: "",
        product_sale_price: "",
        product_purchase_price: "",
        product_color: "",
        product_material: "",
        product_weight: "",
        product_description: "",
        product_image: [],
        product_on_sale: 0,
        product_discount_amount: "",
        product_on_free_delivery: 0,
        product_delivery_charge: "",
    });

    const [selectedFiles, setSelectedFiles] = useState([]);

    const setField = (key, value) => {
        setProductData((prev) => ({ ...prev, [key]: value }));
    };

    
    // ✅ success close
    useEffect(() => {
        if (addProductResponse === true) {
            toggle();
            dispatch(resetAddProductResponse());
        }
    }, [addProductResponse, dispatch, toggle]);

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const onDropFiles = (files) => {
        const mapped = files.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
                formattedSize: formatBytes(file.size),
            })
        );
        setSelectedFiles((prev) => [...prev, ...mapped]);
        setProductData((prev) => ({ ...prev, product_image: [...prev.product_image, ...files] }));
    };

    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setProductData((prev) => ({
            ...prev,
            product_image: prev.product_image.filter((_, i) => i !== index),
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        const errors = {};
        if (!productData.product_name.trim()) errors.product_name = "Product Name is required";

        if (Object.keys(errors).length) {
            setErrorMessage(errors);
            return;
        }

        setErrorMessage({}); 

        dispatch(addProduct(productData)); // (keep same as your API)
    };

    return {
        activeTab,
        setActiveTab,
        productData,
        setField,
        errorMessage,
        selectedFiles,
        onDropFiles,
        removeFile,
        onSubmit,
    };
};
