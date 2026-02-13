import React from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";

import RepairTabBasicInfo from "../Tabs/RepairTabBasicInfo";
import RepairTabDeviceInfo from "../Tabs/RepairTabDeviceInfo";
import RepairTabServiceInfo from "../Tabs/RepairTabServiceInfo";
import RepairTabAdditionalInfo from "../Tabs/RepairTabAdditionalInfo";
import RepairTabGallery from "../Tabs/RepairTabGallery";

const RepairTabs = ({ activeTab, setActiveTab, form, lookups }) => {
  return (
    <>
      <Nav className="nav-tabs nav-tabs-custom nav-success p-2 pb-0 bg-light">
        {[
          ["1", "Basic Information"],
          ["2", "Device Information"],
          ["3", "Service Information"],
          ["4", "Additional Information"],
          ["5", "Repair Gallery"],
        ].map(([id, label]) => (
          <NavItem key={id}>
            <NavLink
              href="#"
              className={classnames({ active: activeTab === id })}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab} className="p-2">
        <TabPane tabId="1">
          <RepairTabBasicInfo form={form} lookups={lookups} />
        </TabPane>
        <TabPane tabId="2">
          <RepairTabDeviceInfo form={form} lookups={lookups} />
        </TabPane>
        <TabPane tabId="3">
          <RepairTabServiceInfo form={form} lookups={lookups} />
        </TabPane>
        <TabPane tabId="4">
          <RepairTabAdditionalInfo form={form} lookups={lookups} />
        </TabPane>
        <TabPane tabId="5">
          <RepairTabGallery form={form} />
        </TabPane>
      </TabContent>
    </>
  );
};

export default RepairTabs;
