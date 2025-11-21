import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import Dropzone from "react-dropzone";

const RepairTabGallery = ({ handleAcceptedFiles, selectedFiles, removeFile }) => {
  return (
    <Row>
      <Col lg={12}>
        <Card className="mb-4">
          <CardBody>
            {/* Header */}
            <h5 className="fs-15 mb-1">Repair Gallery</h5>
            <p className="text-muted mb-3">
              Add images related to the repair.
            </p>

            {/* Dropzone */}
            <Dropzone onDrop={handleAcceptedFiles}>
              {({ getRootProps, getInputProps }) => (
                <div
                  className="dropzone dz-clickable"
                  {...getRootProps()}
                >
                  <div className="dz-message needsclick text-center">
                    <div className="mb-3">
                      <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                    </div>
                    <h5>Drop files here or click to upload.</h5>
                  </div>
                  <input {...getInputProps()} />
                </div>
              )}
            </Dropzone>

            {/* Preview Gallery */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h6 className="text-muted mb-3">Preview Gallery</h6>
                <Row className="g-3">
                  {selectedFiles.map((file, i) => (
                    <Col key={i} xs="6" sm="4" md="3" lg="2">
                      <Card className="shadow-sm border-0 h-100">
                        <div className="position-relative">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="img-fluid rounded-top"
                            style={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            className="position-absolute top-0 end-0 m-1 bg-white rounded-circle shadow-sm"
                            style={{
                              width: "25px",
                              height: "25px",
                              cursor: "pointer",
                            }}
                            title="Remove Image"
                            onClick={() => removeFile(i)}
                          >
                            <i
                              className="ri-close-line text-danger d-flex justify-content-center align-items-center"
                              style={{
                                fontSize: "16px",
                                height: "100%",
                              }}
                            ></i>
                          </div>
                        </div>
                        <div className="p-2 text-center">
                          <p
                            className="mb-0 fw-semibold text-truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <small className="text-muted">
                            {file.formattedSize}
                          </small>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default RepairTabGallery;
