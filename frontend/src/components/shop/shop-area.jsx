import React, { useState, useEffect } from "react";
import Pagination from "@/ui/Pagination";
import ProductItem from "../products/fashion/product-item";
import CategoryFilter from "./shop-filter/category-filter";
import TopRatedProducts from "./shop-filter/top-rated-products";
import ShopTopLeft from "./shop-top-left";
import ShopTopRight from "./shop-top-right";
import ResetButton from "./shop-filter/reset-button";
import BrandFilter from "./shop-filter/brand-filter";

const ShopArea = ({ all_products, products, otherProps, setFilterData, setPriceValue, selectValue }) => {
  const { currPage, setCurrPage, selectHandleFilter } = otherProps;

  const [filteredRows, setFilteredRows] = useState(products);
  const [pageStart, setPageStart] = useState(0);
  const [countOfPage, setCountOfPage] = useState(12);

  useEffect(() => {
    setFilteredRows(products);
    setPageStart(0);
  }, [products]);

  const paginatedData = (items, startPage, pageCount) => {
    setFilteredRows(items);
    setPageStart(startPage);
    setCountOfPage(pageCount);
  };

  return (
    <section className="tp-shop-area pb-120">
      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-4">
            <div className="mr-10">
              <CategoryFilter setCurrPage={setCurrPage} setFilterData={setFilterData} />
              <BrandFilter setCurrPage={setCurrPage} setFilterData={setFilterData} />
              <TopRatedProducts />
              <ResetButton
                setFilterData={setFilterData}
                setPriceValue={setPriceValue}
                setSelectValue={selectHandleFilter}
                setCurrPage={setCurrPage}
              />

            </div>
          </div>

          {/* MAIN */}
          <div className="col-xl-9 col-lg-8">
            <div className="tp-shop-main-wrapper">

              <div className="tp-shop-top mb-45">
                <div className="row">
                  <div className="col-xl-6">
                    <ShopTopLeft
                      showing={filteredRows.slice(pageStart, pageStart + countOfPage).length}
                      total={all_products.length}
                    />
                  </div>
                  <div className="col-xl-6">
                    <ShopTopRight selectHandleFilter={selectHandleFilter} selectValue={selectValue} />
                  </div>
                </div>
              </div>

              {filteredRows.length === 0 && (
                <div className="tp-shop-empty text-center py-5">
                  <lord-icon
                    src="https://cdn.lordicon.com/msoeawqm.json"
                    trigger="loop"
                    colors="primary:#405189,secondary:#0ab39c"
                    style={{ width: "72px", height: "72px" }}
                  />
                  <div className="mt-4">
                    <h5>Sorry! No Result Found</h5>
                    <p className="text-muted">
                      Try changing filters or reset them
                    </p>
                  </div>
                </div>
              )}

              {filteredRows.length > 0 && (
                <div className="tp-shop-items-wrapper tp-shop-item-primary">
                  <div className="row">
                    {filteredRows
                      .slice(pageStart, pageStart + countOfPage)
                      .map((item) => (
                        <div key={item.product_id} className="col-xl-4 col-md-6 col-sm-6">
                          <ProductItem product={item} />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="tp-shop-pagination mt-20">
                <div className="tp-pagination">

                  <Pagination
                    items={filteredRows}
                    countOfPage={countOfPage}
                    paginatedData={paginatedData}
                    currPage={currPage}
                    setCurrPage={setCurrPage}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopArea;
