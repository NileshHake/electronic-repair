import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getCategoriesList, resetAddCategoryResponse } from "../../../store/category";
import { getTaxesList, resetAddTaxResponse } from "../../../store/Tax";
import { getBrandsList } from "../../../store/Brand";

export const useProductLookups = () => {
  const dispatch = useDispatch();

  const { categories, addCategoryResponse } = useSelector((s) => s.CategoryReducer);
  const { taxes, addTaxResponse } = useSelector((s) => s.TaxReducer);
  const { brands } = useSelector((s) => s.BrandReducer);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTaxOpen, setIsTaxOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);

  useEffect(() => {
    dispatch(getCategoriesList());
    dispatch(getBrandsList());
    dispatch(getTaxesList());
  }, [dispatch]);

  useEffect(() => {
    if (addCategoryResponse) {
      setIsCategoryOpen(false);
      dispatch(resetAddCategoryResponse());
      dispatch(getCategoriesList());
    }
    if (addTaxResponse) {
      setIsTaxOpen(false);
      dispatch(resetAddTaxResponse());
      dispatch(getTaxesList());
    }
  }, [addCategoryResponse, addTaxResponse, dispatch]);

  return {
    data: { categories, brands, taxes },
    ui: { isCategoryOpen, setIsCategoryOpen, isTaxOpen, setIsTaxOpen, isBrandOpen, setIsBrandOpen },
  };
};
