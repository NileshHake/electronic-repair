import React from "react";
import { useGetStoreFeatureListQuery } from "@/redux/features/storeFeatureApi";
import { ICONS } from "@/icons";
import { HomePrdLoader } from "../loader";
import ErrorMsg from "../common/error-msg";

const FeatureAreaThree = () => {
  const { data, isLoading, isError } = useGetStoreFeatureListQuery();

  if (isLoading) {
    return (
      <section className="tp-feature-area tp-feature-border-3 tp-feature-style-2 pb-40 pt-45">
        <div className="container">
          <div className="row">
            <HomePrdLoader loading={isLoading} />
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="tp-feature-area tp-feature-border-3 tp-feature-style-2 pb-40 pt-45">
        <div className="container">
          <div className="row">
            <ErrorMsg msg="There was an error loading features!" />
          </div>
        </div>
      </section>
    );
  }

  const features = data?.data || [];

  if (features.length === 0) {
    return (
      <section className="tp-feature-area tp-feature-border-3 tp-feature-style-2 pb-40 pt-45">
        <div className="container">
          <div className="row">
            <ErrorMsg msg="No features found!" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tp-feature-area tp-feature-border-3 tp-feature-style-2 pb-40 pt-45">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-feature-inner-2 d-flex flex-wrap align-items-center justify-content-between">
              {features.map((item, i) => {
                const IconComponent = ICONS?.[item?.icon];

                return (
                  <div
                    key={item?.id || i}
                    className="tp-feature-item-2 d-flex align-items-start mb-40"
                  >
                    <div className="tp-feature-icon-2 mr-10">
                      <span>{IconComponent ? <IconComponent size={28} /> : null}</span>
                    </div>
                    <div className="tp-feature-content-2">
                      <h3 className="tp-feature-title-2">{item?.title}</h3>
                      <p>{item?.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureAreaThree;
