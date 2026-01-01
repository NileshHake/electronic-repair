import React from "react";
import { useGetStoreFeatureListQuery } from "@/redux/features/storeFeatureApi";
import { ICONS } from "@/icons";
import { HomePrdLoader } from "../loader";
import ErrorMsg from "../common/error-msg";

const FeatureArea = () => {
  const { data, isLoading, isError } = useGetStoreFeatureListQuery();


  let features = [];
  if (Array.isArray(data?.data)) {
    features = data.data;
  } else if (Array.isArray(data)) {
    features = data;
  }

  let content;

  if (isLoading) {
    content = (
      <div className="row">
        <HomePrdLoader loading={isLoading} />
      </div>
    );
  } else if (isError) {
    content = (
      <div className="row">
        <ErrorMsg msg="There was an error loading features!" />
      </div>
    );
  } else if (features.length === 0) {
    content = (
      <div className="row">
        <ErrorMsg msg="No features found!" />
      </div>
    );
  } else {
    content = (
      <div className="row gx-1 gy-1 gy-xl-0">
        {features.slice(0, 4).map((item, i) => {
          const IconComponent = ICONS[item.icon];
          return (
            <div key={i} className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
              <div className="tp-feature-item d-flex align-items-start">
                <div className="tp-feature-icon mr-15">
                  <span>
                    {IconComponent && <IconComponent size={40} />}
                  </span>
                </div>
                <div className="tp-feature-content">
                  <h3 className="tp-feature-title">{item.title}</h3>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.9rem" }}>{item.description}</p>
                </div>
              </div>
            </div>


          );
        })}
      </div>
    );
  }

  return (
    <section className="tp-feature-area tp-feature-border-radius pb-70">
      <div className="container">{content}</div>
    </section>
  );
};

export default FeatureArea;
