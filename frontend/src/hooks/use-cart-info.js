import { useGetCartListQuery } from "@/redux/features/cartApi";
import { useEffect, useState } from "react";

const useCartInfo = () => {
    const [quantity, setQuantity] = useState(0); // total items count
    const [total, setTotal] = useState(0);       // total price

    // Fetch cart list from backend
    const { data } = useGetCartListQuery();
    const cart_products = data?.items || [];

    useEffect(() => {
        // total number of products in cart
        setQuantity(cart_products.length || 0);

        // calculate total price
        const totalPrice = cart_products.reduce((sum, item) => {
            const price = item.product_sale_price || item.price || 0;
            const qty = item.add_to_card_product_qty || item.orderQuantity || 1;
            return sum + price * qty;
        }, 0);

        setTotal(totalPrice);
    }, [cart_products]);

    return {
        quantity,
        total,
        setTotal,
    };
};

export default useCartInfo;
