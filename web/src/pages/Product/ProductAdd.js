import React from "react";
import { Modal, ModalHeader, ModalFooter, Card, Button } from "reactstrap";

import { useProductForm } from "./hooks/useProductForm";
import { useProductLookups } from "./hooks/useProductLookups";
import ProductTabs from "./component/ProductTabs";
import CategoryAdd from "../category/CategoryAdd";
import TaxAdd from "../Tax/TaxAdd";
import BrandAdd from "../Brand/BrandAdd";


const ProductAdd = ({ isOpen, toggle }) => {
  const lookups = useProductLookups();
  const form = useProductForm({ toggle });


  return (
    <Modal size="xl" isOpen={isOpen} centered toggle={toggle}>
      <ModalHeader toggle={toggle} className="modal-title ms-2">
        Add Product
      </ModalHeader>

      <form onSubmit={form.onSubmit}>
        <div className="p-4">
          <Card className="border card-border-success shadow-lg  ">
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
                  Save
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
          toggle={() => lookups.ui.setIsCategoryOpen(false)}
        />
      )}
      {lookups.ui.isTaxOpen && (
        <TaxAdd
          isOpen={lookups.ui.isTaxOpen}
          toggle={() => lookups.ui.setIsTaxOpen(false)}
        />
      )}
      {lookups.ui.isBrandOpen && (
        <BrandAdd
          isOpen={lookups.ui.isBrandOpen}
          toggle={() => lookups.ui.setIsBrandOpen(false)}
        />
      )}
    </Modal>
  );
};

export default ProductAdd;
