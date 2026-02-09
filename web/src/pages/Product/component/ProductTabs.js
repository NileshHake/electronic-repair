import React from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";

import PrimaryInfoTab from "./PrimaryInfoTab";
import GalleryTab from "./GalleryTab";

const ProductTabs = ({ activeTab, setActiveTab, form, lookups }) => {
  return (
    <>
      <Nav className="nav-tabs nav-tabs-custom nav-success p-2 pb-0 bg-light">
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === "1" })}
            onClick={() => setActiveTab("1")}
          >
            Primary Information
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            className={classnames({ active: activeTab === "2" })}
            onClick={() => setActiveTab("2")}
          >
            Product Gallery
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab} className="p-2">
        <TabPane tabId="1">
          <PrimaryInfoTab form={form} lookups={lookups} />
        </TabPane>
        <TabPane tabId="2">
          <GalleryTab form={form} />
        </TabPane>
      </TabContent>
    </>
  );
};

export default ProductTabs;
