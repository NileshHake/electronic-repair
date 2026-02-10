import React, { useEffect } from "react";
import { Modal, ModalHeader, ModalFooter, Card, Button } from "reactstrap";

import { useProductForm } from "./hooks/useProductForm";
import { useProductLookups } from "./hooks/useProductLookups";
import ProductTabs from "./component/ProductTabs";

import CategoryAdd from "../category/CategoryAdd";
import TaxAdd from "../Tax/TaxAdd";
import BrandAdd from "../Brand/BrandAdd";
import RamAdd from "../Ram/RamAdd";
import GenerationAdd from "../Generation/GenerationAdd";
import { resetUpdateProductResponse } from "../../store/product";
import { useDispatch, useSelector } from "react-redux";

const ProductUpdate = ({ isOpen, toggle, isProductData }) => {
  const lookups = useProductLookups();
  const dispatch = useDispatch();
  // ✅ mode=update + initialData for prefill
  const form = useProductForm({ toggle, mode: "update", initialData: isProductData });

  // when modal opens with different product
  useEffect(() => {
    if (isProductData) {
      form.setInitialData(isProductData);
    }
    // eslint-disable-next-line
  }, [isProductData]);
const { updateProductResponse } = useSelector((state) => state.ProductReducer);

  useEffect(() => {
    if (updateProductResponse) {
      toggle(); // ✅ close modal
      dispatch(resetUpdateProductResponse()); // ✅ reset flag
    }
  }, [updateProductResponse, dispatch, toggle]);

  return (
    <Modal size="xl" isOpen={isOpen} centered toggle={toggle}>
      <ModalHeader toggle={toggle} className="modal-title ms-2">
        Update Product
      </ModalHeader>

      <form onSubmit={form.onSubmit}>
        <div className="p-4">
          <Card className="border card-border-success shadow-lg">
            <ProductTabs
              activeTab={form.activeTab}
              setActiveTab={form.setActiveTab}
              form={form}
              lookups={lookups}
            />

            <ModalFooter>
              <div className="hstack gap-2 justify-content-center mt-2">
                <Button color="danger" type="button" onClick={toggle}>
                  Close
                </Button>
                <Button color="primary" type="submit">
                  Update
                </Button>
              </div>
            </ModalFooter>
          </Card>
        </div>
      </form>

      {/* Sub Modals */}
      {lookups.ui.isCategoryOpen && (
        <CategoryAdd
          isOpen={lookups.ui.isCategoryOpen}
          toggle={() => {
            lookups.ui.setIsCategoryOpen(false);
            lookups.refetch();
          }}
        />
      )}

      {lookups.ui.isTaxOpen && (
        <TaxAdd
          isOpen={lookups.ui.isTaxOpen}
          toggle={() => {
            lookups.ui.setIsTaxOpen(false);
            lookups.refetch();
          }}
        />
      )}

      {lookups.ui.isBrandOpen && (
        <BrandAdd
          isOpen={lookups.ui.isBrandOpen}
          toggle={() => {
            lookups.ui.setIsBrandOpen(false);
            lookups.refetch();
          }}
        />
      )}

      {lookups.ui.isGenerationOpen && (
        <GenerationAdd
          isOpen={lookups.ui.isGenerationOpen}
          toggle={() => {
            lookups.ui.setIsGenerationOpen(false);
            lookups.refetch();
          }}
        />
      )}

      {lookups.ui.isRamOpen && (
        <RamAdd
          isOpen={lookups.ui.isRamOpen}
          toggle={() => {
            lookups.ui.setIsRamOpen(false);
            lookups.refetch();
          }}
        />
      )}
    </Modal>
  );
};

export default ProductUpdate;
