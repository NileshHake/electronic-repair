import { useState } from "react";
import { Search } from "@/svg";
import NiceSelect from "@/ui/nice-select";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
import { useGetCategoriesWithSubQuery } from "@/redux/features/categoryApi";

const HeaderSearchForm = () => {
  const { setSearchText, setCategory, handleSubmit, searchText } =
    useSearchFormSubmit();

  const {
    data: categories = [], // ✅ default empty array
    isLoading,
    isError,
  } = useGetCategoriesWithSubQuery();

  console.log("categories", categories);

  const selectCategoryHandle = (e) => {
    setCategory(e.value);
  };
  const options = [
    { value: "", label: "Select Category" },
    ...(categories || []).map((cat) => ({
      value: (cat.category_id),
      label: cat.category_name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="tp-header-search-wrapper d-flex align-items-center">
        <div className="tp-header-search-box">
          <input
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            type="text"
            placeholder="Search for Products..."
          />
        </div>

        <div  >
     


        </div>

        <div className="tp-header-search-btn">
          <button type="submit">
            <Search />
          </button>
        </div>
      </div>
    </form>
  );
};

export default HeaderSearchForm;
