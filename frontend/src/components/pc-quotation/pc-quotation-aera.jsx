import React, { useMemo } from "react";
import { useGetCategoriesWithSubQuery } from "@/redux/features/categoryApi";
import CategorySelectGrid from "./CategorySelectGrid";

const PCQuotationArea = () => {
  const { data: categories, isLoading, isError } = useGetCategoriesWithSubQuery();

  const categoryList = useMemo(() => {
    return Array.isArray(categories) ? categories : categories?.data || [];
  }, [categories]);

  if (isLoading) return <div className="container mt-4">Loading categories...</div>;
  if (isError) return <div className="container mt-4 text-danger">Failed to load categories</div>;

  return (
    <div className="container mt-4">
      <h5 className="fw-bold mb-3">PC Quotation</h5>

      <CategorySelectGrid categoryList={categoryList} />
    </div>
  );
};

export default PCQuotationArea;
