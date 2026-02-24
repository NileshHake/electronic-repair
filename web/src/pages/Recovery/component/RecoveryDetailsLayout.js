/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Recovery/RecoveryComponent/RecoveryDetailsLayout.js
import React from "react";
import { Row, Col, Card, CardBody, Table, Progress } from "reactstrap";
import { formatDateTime } from "../../../helpers/date_and_time_format"; 
import RecentStatus from "../../Repairing/OverView/RecentStatus";
// ⚠️ path change kar if your RecentStatus file is elsewhere

const RecoveryDetailsLayout = ({
  singleRecovery,
  services,
  activityTab,
  profileCompletion = 100,
}) => {
  return (
    <Row>
      {/* LEFT COLUMN */}
      <Col xxl={3}>
        <Card className="shadow-sm border-0 mb-3">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-title mb-0">Profile Completion</h5>
              <span className="badge bg-soft-success text-success">
                {profileCompletion}%
              </span>
            </div>
            <p className="text-muted mb-3">Customer profile is fully completed.</p>
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
                      {singleRecovery?.customer_name || "-"}
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
                        +91 {singleRecovery?.customer_phone_number || "-"}
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
                      {singleRecovery?.customer_email ? (
                        <a
                          href={`mailto:${singleRecovery?.customer_email}`}
                          className="text-decoration-underline"
                        >
                          {singleRecovery?.customer_email}
                        </a>
                      ) : (
                        "-"
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
                        {formatDateTime(singleRecovery?.recovery_received_date) ||
                          "-"}
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
                        {formatDateTime(
                          singleRecovery?.recovery_expected_delivery_date
                        ) || "N/A"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>

        {/* Snapshot */}
        <Card className="shadow-sm border-0">
          <CardBody>
            <div className="d-flex align-items-center mb-3">
              <div className="avatar-sm me-3">
                <div className="avatar-title bg-soft-warning text-warning rounded-circle fs-20">
                  <i className="ri-macbook-line"></i>
                </div>
              </div>
              <div>
                <h5 className="card-title mb-0">Recovery Snapshot</h5>
                <small className="text-muted">Quick overview</small>
              </div>
            </div>

            <div className="mb-2">
              <small className="text-muted d-block">Current Stage</small>
              <span className="badge bg-soft-warning text-warning fw-semibold mt-1">
                {singleRecovery?.workflow_stage_name ||
                  singleRecovery?.workflow_stage_name ||
                  "N/A"}
              </span>
            </div>

            <div className="mb-2">
              <small className="text-muted d-block">Workflow</small>
              <span className="text-dark fw-semibold">
                {singleRecovery?.workflow_name || "-"}
              </span>
            </div>

            <div className="mb-2">
              <small className="text-muted d-block">Technician</small>
              <span className="text-dark">{singleRecovery?.technician_name || "-"}</span>
            </div>

            <div>
              <small className="text-muted d-block">Delivery Boy</small>
              <span className="text-dark">{singleRecovery?.delivery_boy_name || "-"}</span>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* RIGHT COLUMN */}
      <Col xxl={9}>
        <Row className="g-3">
          <Col lg={12}>
            <Card className="shadow-sm border-0">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0 fw-semibold">
                    Recovery Description
                  </h5>
                  <span className="badge bg-soft-secondary text-secondary">
                    Details
                  </span>
                </div>

                {singleRecovery?.recovery_problem_description ? (
                  <div
                    className="text-muted"
                    dangerouslySetInnerHTML={{
                      __html: singleRecovery.recovery_problem_description,
                    }}
                  />
                ) : (
                  <p className="text-muted mb-0">Not Assigned</p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>    <RecentStatus singleRecovery={singleRecovery} activityTab={activityTab} module="recovery" />
      </Col>
    </Row>
  );
};

export default RecoveryDetailsLayout;