// components/CategoryProducts.jsx
import React from "react";
import { useGetProductsForQuotationQuery } from "@/redux/features/productApi";

const CategoryProducts = ({ categoryId }) => {
  const { data, isLoading, isError } = useGetProductsForQuotationQuery(
    { category_id: categoryId },
    { skip: !categoryId }
  );

  const products = Array.isArray(data?.data) ? data.data : [];

  if (!categoryId) return null;
  if (isLoading) return <div className="text-muted">Loading products...</div>;
  if (isError) return <div className="text-danger">Failed to load products</div>;

  return (
    <div className="mt-2 border rounded p-2">
      {products.length === 0 ? (
        <div className="text-muted">No products found</div>
      ) : (
        <ul className="mb-0">
          {products.map((p) => (
            <li key={p.product_id}>
              {p.product_name} - ₹{p.product_sale_price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryProducts;
