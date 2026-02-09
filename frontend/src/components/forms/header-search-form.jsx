import { Search } from "@/svg";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { useLazySearchProductsQuery } from "@/redux/features/productApi";
import { useRouter } from "next/router";

const HeaderSearchForm = () => {
  const { setSearchText, handleSubmit } = useSearchFormSubmit();
  const router = useRouter();

  // 🔍 RTK Query search hook
  const [triggerSearch, { data = [], isLoading }] =
    useLazySearchProductsQuery();

  // 🔹 AsyncTypeahead search
  const handleSearch = (query) => {
    if (query.length < 2) return;
    triggerSearch(query); // POST { search: query }
  };

  // 🔹 On select item → navigate to shop with category + brand
  const handleChange = (selected) => {
    if (selected.length > 0) {


      const product = selected[0];
      setSearchText(product.product_name);

      // ✅ Navigate to /shop with params


      router.push({
        pathname: "/shop",
        query: {
          category_id: product.category_id,
          brand_id: product.brand_id,
        },
      });
    }
  };
console.log("data",data);

  return (
    <form onSubmit={handleSubmit}>
      <div className="tp-header-search-wrapper d-flex align-items-center">

        {/* 🔹 Async Typeahead */}
        <div
          className="tp-header-search-box"
          style={{ width: "clamp(160px, 40vw, 350px)" }}
        >
          <AsyncTypeahead
            id="header-search"
            isLoading={isLoading}
            options={data?.data || []}
            labelKey="product_name"
            minLength={2}
            onSearch={handleSearch}
            onChange={handleChange}
            placeholder="Search for Products..."
            clearButton
            maxResults={50}     
            paginate={false}
            filterBy={() => true}   
            inputProps={{
              style: {
                border: "none",
                boxShadow: "none",
                outline: "none",
              },
            }}
            renderMenuItemChildren={(option) => (
              <div key={option.product_id} style={{ lineHeight: 1.2 }}>
                <div className="fw-semibold">{option.product_name}</div>

                <div style={{ fontSize: 12, color: "#666" }}>
                  Brand: {option.brand_name || "-"} | Category: {option.category_name || "-"}
                </div>

               
              </div>
            )}

          />
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
