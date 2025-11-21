import React from "react";
import { Row, Col, Card, CardBody, Table, Progress } from "reactstrap";
import RecentStatus from "./RecentStatus";
import { formatDateTime } from "../../../helpers/date_and_time_format";

const RepairDetailsLayout = ({
  singleRepair,
  services,
  activityTab,
  profileCompletion = 100,
}) => {
  return (
    <Row>
      {/* LEFT COLUMN – CUSTOMER + JOB SNAPSHOT */}
      <Col xxl={3}>
        {/* Profile Completion */}
        <Card className="shadow-sm border-0 mb-3">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-title mb-0">Profile Completion</h5>
              <span className="badge bg-soft-success text-success">
                {profileCompletion}%
              </span>
            </div>
            <p className="text-muted mb-3">
              Customer profile is fully completed.
            </p>
            <Progress
              value={profileCompletion}
              color="danger"
              className="animated-progess custom-progress progress-label"
            >
              <div className="label">{profileCompletion}%</div>
            </Progress>
          </CardBody>
        </Card>

        {/* Customer Info */}
        <Card className="shadow-sm border-0 mb-3">
          <CardBody>
            <div className="d-flex align-items-center mb-3">
              <div className="avatar-sm me-3">
                <div className="avatar-title bg-soft-primary text-waring rounded-circle fs-20">
                  <i className="ri-user-3-line"></i>
                </div>
              </div>
              <div>
                <h5 className="card-title mb-0">Customer Info</h5>
                <small className="text-muted">Basic customer details</small>
              </div>
            </div>

            <div className="table-responsive">
              <Table className="align-middle mb-0">
                <tbody>
                  <tr>
                    <th
                      className="ps-0 text-muted fw-semibold"
                      scope="row"
                      style={{ width: "38%", whiteSpace: "nowrap" }}
                    >
                      Full Name
                    </th>
                    <td className="text-dark fw-semibold">
                      {singleRepair?.customer_name || "-"}
                    </td>
                  </tr>

                  <tr>
                    <th
                      className="ps-0 text-muted fw-semibold"
                      scope="row"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Mobile
                    </th>
                    <td className="text-dark">
                      <span className="badge bg-light text-body fw-normal">
                        <i className="ri-smartphone-line me-1 align-middle" />
                        +91 {singleRepair?.customer_phone_number || "-"}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <th
                      className="ps-0 text-muted fw-semibold"
                      scope="row"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      E-mail
                    </th>
                    <td className="text-dark">
                      {singleRepair?.customer_email ? (
                        <a
                          href={`mailto:${singleRepair?.customer_email}`}
                          className="text-decoration-underline"
                        >
                          {singleRepair?.customer_email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th
                      className="ps-0 text-muted fw-semibold align-top"
                      scope="row"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Location
                    </th>
                    <td className="text-dark">
                      {singleRepair?.customer_address_description ? (
                        <div className="d-flex align-items-start gap-2">
                          <div
                            className="p-2 rounded bg-light-subtle border flex-grow-1"
                            style={{
                              maxHeight: "110px",
                              overflowY: "auto",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: singleRepair.customer_address_description,
                            }}
                          ></div>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th
                      className="ps-0 text-muted fw-semibold"
                      scope="row"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Received Date
                    </th>
                    <td className="text-dark">
                      <span className="badge bg-soft-success text-success fw-normal">
                        <i className="ri-calendar-line me-1 align-middle" />
                        {formatDateTime(singleRepair?.repair_received_date) || "-"}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <th
                      className="ps-0 text-muted fw-semibold"
                      scope="row"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Expected Delivery
                    </th>
                    <td className="text-dark">
                      <span className="badge bg-soft-info text-info fw-normal">
                        <i className="ri-calendar-check-line me-1 align-middle" />
                        {singleRepair?.repair_expected_delivery_date || "N/A"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>

        {/* Job Snapshot */}
        <Card className="shadow-sm border-0">
          <CardBody>
            <div className="d-flex align-items-center mb-3">
              <div className="avatar-sm me-3">
                <div className="avatar-title bg-soft-warning text-warning rounded-circle fs-20">
                  <i className="ri-macbook-line"></i>
                </div>
              </div>
              <div>
                <h5 className="card-title mb-0">Job Snapshot</h5>
                <small className="text-muted">Quick job overview</small>
              </div>
            </div>

            <div className="mb-2">
              <small className="text-muted d-block">Current Stage</small>
              <span className="badge bg-soft-warning text-warning fw-semibold mt-1">
                {singleRepair?.workflow_stage_name || "N/A"}
              </span>
            </div>

            <div className="mb-2">
              <small className="text-muted d-block">Priority</small>
              <span className="badge bg-soft-danger text-danger fw-semibold mt-1">
                {singleRepair?.repair_device_priority || "N/A"}
              </span>
            </div>

            <hr className="my-3" />

            <div className="mb-2">
              <small className="text-muted d-block">Workflow</small>
              <span className="text-dark fw-semibold">
                {singleRepair?.workflow_name || "-"}
              </span>
            </div>

            <div className="mb-2">
              <small className="text-muted d-block">Source</small>
              <span className="text-dark">
                {singleRepair?.source_name || "-"}
              </span>
            </div>

            <div className="mb-2">
              <small className="text-muted d-block">Service Type</small>
              <span className="text-dark">
                {singleRepair?.service_type_name || "-"}
              </span>
            </div>

            <div>
              <small className="text-muted d-block">Repair Type</small>
              <span className="text-dark">
                {singleRepair?.repair_type_name || "-"}
              </span>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* RIGHT COLUMN – ASSIGNMENT / HARDWARE / DEVICE / PROBLEMS / DESCRIPTION */}
      <Col xxl={9}>
        <Row className="g-3">
          {/* Assignment + Hardware */}
          <Col lg={7}>
            <Card className="shadow-sm border-0 h-100">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0 fw-semibold">
                    Assignment & Hardware
                  </h5>
                  <span className="badge bg-soft-secondary text-secondary">
                    Repair ID: {singleRepair?.repair_id || "-"}
                  </span>
                </div>

                {/* Technician & Delivery Boy */}
                <Row>
                  <Col xs={12} md={6}>
                    <div className="d-flex mb-3">
                      <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                        <div className="avatar-title bg-soft-warning text-warning rounded-circle fs-16">
                          <i className="ri-user-2-fill"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <p className="mb-1 text-muted">Technician</p>
                        <h6 className="text-truncate mb-0">
                          {singleRepair?.technician_name || "Not Assigned"}
                        </h6>
                      </div>
                    </div>
                  </Col>

                  <Col xs={12} md={6}>
                    <div className="d-flex mb-3">
                      <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                        <div className="avatar-title bg-soft-warning text-warning rounded-circle fs-16">
                          <i className="ri-user-2-fill"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <p className="mb-1 text-muted">Delivery Boy</p>
                        <h6 className="text-truncate mb-0">
                          {singleRepair?.delivery_boy_name || "Not Assigned"}
                        </h6>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Dates */}
                <Row className="g-3 mb-3">
                  <Col xs={12} md={6}>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 avatar-xs me-3">
                        <div className="avatar-title bg-soft-info text-info rounded-circle fs-16">
                          <i className="ri-calendar-line"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <p className="mb-1 text-muted">Received</p>
                        <h6 className="mb-0 text-truncate">
                          {formatDateTime(singleRepair?.repair_received_date) || "N/A"}
                        </h6>
                      </div>
                    </div>
                  </Col>

                  <Col xs={12} md={6}>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 avatar-xs me-3">
                        <div className="avatar-title bg-soft-success text-success rounded-circle fs-16">
                          <i className="ri-calendar-check-line"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <p className="mb-1 text-muted">Expected Delivery</p>
                        <h6 className="mb-0 text-truncate">
                          {singleRepair?.repair_expected_delivery_date || "N/A"}
                        </h6>
                      </div>
                    </div>
                  </Col>
                </Row>

                <hr className="my-3" />

                {/* Hardware & Storage */}
                <h6 className="text-muted mb-2">Hardware & Configuration</h6>
                <Row className="g-2 small">
                  <Col sm={6}>
                    <small className="text-muted d-block">Processor</small>
                    <span className="fw-semibold d-block">
                      {singleRepair?.hardware_configuration_processor || "-"}
                    </span>
                  </Col>
                  <Col sm={6}>
                    <small className="text-muted d-block">RAM</small>
                    <span className="fw-semibold d-block">
                      {singleRepair?.hardware_configuration_ram || "-"}
                    </span>
                  </Col>
                  <Col sm={6}>
                    <small className="text-muted d-block">HDD</small>
                    <span className="fw-semibold d-block">
                      {singleRepair?.hardware_configuration_hard_disk || "-"}
                    </span>
                  </Col>
                  <Col sm={6}>
                    <small className="text-muted d-block">SSD</small>
                    <span className="fw-semibold d-block">
                      {singleRepair?.hardware_configuration_ssd || "-"}
                    </span>
                  </Col>
                  <Col sm={6}>
                    <small className="text-muted d-block">Graphics</small>
                    <span className="fw-semibold d-block">
                      {singleRepair?.hardware_configuration_graphics_card ||
                        "-"}
                    </span>
                  </Col>
                  <Col sm={6}>
                    <small className="text-muted d-block">
                      Storage Location
                    </small>
                    <span className="fw-semibold d-block">
                      {singleRepair?.storage_location_name || "N/A"}
                    </span>
                  </Col>

                  {/* Repair Estimated Cost */}
                  <Col sm={6}>
                    <small className="text-muted d-block">Estimated Cost</small>
                    <span className="fw-semibold d-block">
                      {singleRepair?.repair_estimated_cost
                        ? `₹${singleRepair.repair_estimated_cost}`
                        : "-"}
                    </span>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {/* Device & Problems */}
          <Col lg={5}>
            <Card className="shadow-sm border-0 mb-3">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0 fw-semibold">
                    Device Details
                  </h5>
                  <span className="badge bg-soft-primary text-primary">
                    {singleRepair?.device_type_name || "Device"}
                  </span>
                </div>

                <div className="mb-2">
                  <small className="text-muted d-block">Device Type</small>
                  <span className="fw-semibold d-block">
                    {singleRepair?.device_type_name || "N/A"}
                  </span>
                </div>

                <div className="mb-2">
                  <small className="text-muted d-block">Brand</small>
                  <span className="fw-semibold d-block">
                    {singleRepair?.brand_name || "N/A"}
                  </span>
                </div>

                <div className="mb-2">
                  <small className="text-muted d-block">Model</small>
                  <span className="fw-semibold d-block">
                    {singleRepair?.device_model_name || "N/A"}
                  </span>
                </div>

                <div className="mb-2">
                  <small className="text-muted d-block">Color</small>
                  <span className="fw-semibold d-block">
                    {singleRepair?.device_color_name || "N/A"}
                  </span>
                </div>

                <div>
                  <small className="text-muted d-block">Serial Number</small>
                  <span className="fw-semibold d-block">
                    {singleRepair?.repair_device_serial_number || "N/A"}
                  </span>
                </div>
              </CardBody>
            </Card>

           <Card className="shadow-sm border-0">
  <CardBody>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="card-title mb-0 fw-semibold">Problems</h5>
      <span className="badge bg-soft-secondary text-secondary">
        Issues Selected
      </span>
    </div>
   <div className="d-flex flex-wrap gap-3">
  {singleRepair?.repair_device_services_id ? (
    (() => {
      const servicesArray = JSON.parse(singleRepair.repair_device_services_id);
      if (servicesArray.length === 0)
        return <span className="text-muted fs-5">No problems selected</span>;

      return servicesArray.map((service, index) => (
        <div
          key={index}
          className="px-3 py-2 bg-primary-subtle text-primary rounded fw-semibold"
          style={{ fontSize: "15px" }} // make it bigger
        >
          {index + 1}. Service: {service.service}, Cost: {service.cost}
        </div>
      ));
    })()
  ) : (
    <span className="text-muted fs-5">No problems selected</span>
  )}
</div>

  </CardBody>
</Card>

          </Col>
        </Row>

        {/* Problem Description LAST */}
        <Card className="shadow-sm border-0 mt-3">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-title mb-0 fw-semibold">
                Problem Description
              </h5>
              <span className="badge bg-soft-secondary text-secondary">
                Details
              </span>
            </div>
            {singleRepair?.repair_problem_description ? (
              <div
                className="text-muted"
                dangerouslySetInnerHTML={{
                  __html: singleRepair.repair_problem_description,
                }}
              />
            ) : (
              <p className="text-muted mb-0">Not Assigned</p>
            )}
          </CardBody>
        </Card>

        <RecentStatus singleRepair={singleRepair} activityTab={activityTab} />
      </Col>
    </Row>
  );
};

export default RepairDetailsLayout;
