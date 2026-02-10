import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import Dropzone from "react-dropzone";

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const GalleryTab = ({ form }) => {
  const { galleryFiles, setGalleryFiles } = form;

  const handleAcceptedFiles = (files) => {
    const mappedFiles = files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
        isExisting: false,
      })
    );

    setGalleryFiles((prev) => [...prev, ...mappedFiles]);
  };

  const removeFile = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Row>
      <Col lg={12}>
        <Card className="mb-4">
          <CardBody>
            <h5 className="fs-15 mb-1">Product Gallery</h5>
            <p className="text-muted">Add Product Gallery Images.</p>

            <Dropzone onDrop={handleAcceptedFiles}>
              {({ getRootProps, getInputProps }) => (
                <div className="dropzone dz-clickable" {...getRootProps()}>
                  <div className="dz-message needsclick">
                    <div className="mb-3">
                      <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                    </div>
                    <h5>Drop files here or click to upload.</h5>
                  </div>
                  <input {...getInputProps()} />
                </div>
              )}
            </Dropzone>

            <div className="mt-4">
              <h6 className="text-muted mb-3">Preview Gallery</h6>

              <Row className="g-3">
                {(galleryFiles || []).map((file, i) => (
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
                            opacity: file.isExisting ? 0.9 : 1,
                          }}
                        />

                        <div
                          className="position-absolute top-0 end-0 m-1 bg-white rounded-circle shadow-sm"
                          style={{ width: "25px", height: "25px", cursor: "pointer" }}
                          title="Remove Image"
                          onClick={() => removeFile(i)}
                        >
                          <i
                            className="ri-close-line text-danger d-flex justify-content-center align-items-center"
                            style={{ fontSize: "16px", height: "100%" }}
                          ></i>
                        </div>
                      </div>

                      <div className="p-2 text-center">
                        <p className="mb-0 fw-semibold text-truncate" title={file.name}>
                          {file.name}
                        </p>
                        <small className="text-muted">
                          {file.formattedSize || (file.isExisting ? "Existing Image" : "")}
                        </small>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default GalleryTab;
