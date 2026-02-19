import React, { useMemo } from "react";
import { useGetCategoryListQuery } from "@/redux/features/categoryApi";
import CategorySelectGrid from "./CategorySelectGrid";

const PC_MAIN_ID = 12;

const PCQuotationArea = () => {
  // ✅ Call NEW API (/category/list)
  const { data, isLoading, isError } = useGetCategoryListQuery();

  // ✅ Filter only PC child categories (category_main_id = 12)
  const pcCategoryList = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.data || [];
    return list.filter((c) => Number(c.category_id) <= PC_MAIN_ID);
  }, [data]);

  if (isLoading)
    return <div className="container mt-4">Loading categories...</div>;

  if (isError)
    return (
      <div className="container mt-4 text-danger">
        Failed to load categories
      </div>
    );

  return (
    <div className="container mt-4">
      <h5 className="fw-bold mb-3">PC Quotation</h5>

      {/* ✅ Send only PC categories */}
      <CategorySelectGrid categoryList={pcCategoryList} />
    </div>
  );
};

export default PCQuotationArea;
