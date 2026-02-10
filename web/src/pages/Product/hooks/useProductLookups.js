import { useEffect, useState } from "react";
import { APIClient } from "../../../helpers/api_helper";

const api = new APIClient();

export const useProductLookups = () => {
  const [data, setData] = useState({
    categories: [],
    brands: [],
    taxes: [],
    generations: [], // ✅ add
    rams: [],        // ✅ add
  });

  const [ui, setUi] = useState({
    isCategoryOpen: false,
    isTaxOpen: false,
    isBrandOpen: false,
    isGenerationOpen: false, // add✅ 
    isRamOpen: false,        // ✅ add

    setIsCategoryOpen: () => {},
    setIsTaxOpen: () => {},
    setIsBrandOpen: () => {},
    setIsGenerationOpen: () => {}, // ✅ add
    setIsRamOpen: () => {},        // ✅ add
  });

  // setters (so you can use lookups.ui.setIsXOpen like you do)
  ui.setIsCategoryOpen = (v) => setUi((p) => ({ ...p, isCategoryOpen: v }));
  ui.setIsTaxOpen = (v) => setUi((p) => ({ ...p, isTaxOpen: v }));
  ui.setIsBrandOpen = (v) => setUi((p) => ({ ...p, isBrandOpen: v }));
  ui.setIsGenerationOpen = (v) => setUi((p) => ({ ...p, isGenerationOpen: v }));
  ui.setIsRamOpen = (v) => setUi((p) => ({ ...p, isRamOpen: v }));

  const fetchLookups = async () => {
    const [categories, brands, taxes, generations, rams] = await Promise.all([
      api.get("/category/list"),
      api.get("/brand/list"),
      api.get("/tax/list"),
      api.get("/generation/list"), // ✅ add
      api.get("/ram/list"),        // ✅ add
    ]);

    setData({
      categories: categories || [],
      brands: brands || [],
      taxes: taxes || [],
      generations: generations || [],
      rams: rams || [],
    });
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  return { data, ui, refetch: fetchLookups };
};
