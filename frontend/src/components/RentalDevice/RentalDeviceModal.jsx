import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactModal from "react-modal";

import { closeRentalDeviceModal } from "@/redux/features/rentalDeviceModalSlice";
import RentalDetailsThumbWrapper from "@/components/rental-details/rental-details-thumb-wrapper";
import RentalDetailsWrapper from "@/components/rental-details/rental-details-wrapper";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    height: "calc(100% - 300px)",
  },
};

const RentalDeviceModal = () => {
  const { deviceItem, isDeviceModalOpen } = useSelector(
    (state) => state.rentalDeviceModal
  );

  const [activeImg, setActiveImg] = useState(null);
  const dispatch = useDispatch();

  // set default active image when device changes
  useEffect(() => {
    setActiveImg(null);
  }, [deviceItem]);

  const handleImageActive = (imgName) => {
    setActiveImg(imgName);
  };

  return (
    <ReactModal
      isOpen={isDeviceModalOpen}
      onRequestClose={() => dispatch(closeRentalDeviceModal())}
      style={customStyles}
      contentLabel="Rental Device Modal"
    >
      <div className="tp-product-modal">
        <div className="tp-product-modal-content d-lg-flex">
          <button
            onClick={() => dispatch(closeRentalDeviceModal())}
            type="button"
            className="tp-product-modal-close-btn"
          >
            <i className="fa-regular fa-xmark"></i>
          </button>

          <RentalDetailsThumbWrapper
            deviceItem={deviceItem}
            activeImg={activeImg}
            handleImageActive={handleImageActive}
            imgWidth={580}
            imgHeight={670}
          />

          <RentalDetailsWrapper deviceItem={deviceItem} />
        </div>
      </div>
    </ReactModal>
  );
};

export default RentalDeviceModal;