import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { api } from "../../../config";
import { addProduct, updateProduct } from "../../../store/product";

export const useProductForm = ({ toggle, mode = "add", initialData = null }) => {
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState("1");
    const [errorMessage, setErrorMessage] = useState({});

    const [productData, setProductData] = useState({
        product_id: "",
        product_name: "",
        product_category: "",
        product_brand: "",
        product_tax: "",
        product_usage_type: "",
        product_color: "",
        product_material: "",
        product_weight: "",

        product_generation_id: "",
        product_ram_id: "",

        product_support_brand_id: "",
        product_support_generations: [],

        product_on_sale: 0,
        product_discount_amount: 0,
        product_on_free_delivery: 0,
        product_delivery_charge: 0,
        product_image: [],
        product_mrp: 0,
        product_sale_price: 0,
        product_purchase_price: 0,

        product_description: "",
    });

    // ✅ galleryFiles holds BOTH:
    // 1) existing preview objects {preview,name,isExisting:true,fileObj?}
    // 2) new File objects with preview
    const [galleryFiles, setGalleryFiles] = useState([]);

    const setField = (key, value) => {
        setProductData((prev) => ({ ...prev, [key]: value }));
    };

    const setInitialData = (data) => {
        if (!data) return;

        // parse support generations -> array
        let supportArr = [];
        try {
            supportArr = JSON.parse(data.product_support_generations || "[]");
            if (!Array.isArray(supportArr)) supportArr = [];
        } catch (e) {
            supportArr = [];
        }

        setProductData((prev) => ({
            ...prev,
            ...data,
            product_support_generations: supportArr,
        }));

        // parse product images -> show in gallery
        try {
            const imgs = JSON.parse(data.product_image || "[]");
            const mapped = (imgs || []).map((imgName) => ({
                name: imgName,
                preview: api.IMG_URL + "product_images/" + imgName,
                formattedSize: "Existing Image",
                isExisting: true,
            }));
            setGalleryFiles(mapped);
        } catch (e) {
            setGalleryFiles([]);
        }
    };

    useEffect(() => {
        if (mode === "update" && initialData) setInitialData(initialData);
        // eslint-disable-next-line
    }, []);

    // ✅ auto-calc sale price if on sale + discount %
    useEffect(() => {
        const mrp = Number(productData.product_mrp) || 0;
        const discount = Number(productData.product_discount_amount) || 0;

        if (productData.product_on_sale === 1 && mrp > 0 && discount >= 0 && discount <= 100) {
            const salePrice = mrp - (mrp * discount) / 100;
            setProductData((prev) => ({ ...prev, product_sale_price: salePrice.toFixed(2) }));
        }
    }, [productData.product_mrp, productData.product_discount_amount, productData.product_on_sale]);

    const onSubmit = async (e) => {
        e.preventDefault();
        

        const errors = {};
        if (!String(productData.product_name || "").trim()) errors.product_name = "Product Name is required";

        if (Object.keys(errors).length) {
            setErrorMessage(errors);
            return;
        }
        setErrorMessage({});

        // ✅ convert support generations array -> JSON string
        const payload = {
            ...productData,
            product_support_generations: Array.isArray(productData.product_support_generations)
                ? JSON.stringify(productData.product_support_generations)
                : productData.product_support_generations,
        };

        // ✅ FormData (because images)
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
            formData.append(k, v ?? "");
        });

        // ✅ append images
        for (const item of galleryFiles) {
            // existing image -> fetch -> File
            if (item?.isExisting) {
                try {
                    const res = await fetch(item.preview);
                    const blob = await res.blob();
                    const fileObj = new File([blob], item.name, { type: blob.type });
                    formData.append("product_image[]", fileObj);
                } catch (err) {
                    // if fetch fails, skip this file
                    console.log("existing image fetch failed:", item?.name, err);
                }
            } else {
                // new file (already File)
                formData.append("product_image[]", item);
            }
        }

        if (mode === "update") dispatch(updateProduct(formData));
        else { dispatch(addProduct(formData)) };
    };

    return {
        activeTab,
        setActiveTab,

        productData,
        setProductData,
        setField,

        errorMessage,
        setErrorMessage,

        galleryFiles,
        setGalleryFiles,

        onSubmit,
        setInitialData,
    };
};
