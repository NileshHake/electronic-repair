import React from "react";
import { Row, Col, Card } from "reactstrap";
import Dropzone from "react-dropzone";

const AttachmentTabContent = ({
  selectedFiles = [],
  handleAcceptedFiles,
  removeFile,
  selectedVideo = null,
  handleAcceptedVideo,
  removeVideo,
}) => (
  <>
    <Row className="g-3">
      {/* Left: Images (col-12 on mobile, col-6 on md+) */}
      <Col xs="12" md="6">
        <Card className="shadow-sm border-0 p-3 h-100">
          <h6 className="text-muted mb-3">Images</h6>

          {/* Image Upload */}
          <Dropzone
            onDrop={handleAcceptedFiles}
            accept={{ "image/*": [] }}
            multiple
          >
            {({ getRootProps, getInputProps }) => (
              <div
                className="dropzone dz-clickable mb-3 rounded-3"
                {...getRootProps()}
              >
                <div className="dz-message needsclick text-center p-3">
                  <i className="ri-image-add-line fs-1 text-muted mb-2" />
                  <h6 className="mb-0">Drop images here or click to upload</h6>
                  <small className="text-muted">
                    You can upload multiple images.
                  </small>
                </div>
                <input {...getInputProps()} />
              </div>
            )}
          </Dropzone>

          {/* Image Preview Gallery */}
          <div className="mt-2">
            {selectedFiles.length === 0 ? (
              <p className="text-muted mb-0 small">
                No images uploaded yet.
              </p>
            ) : (
              <Row className="g-2">
                {selectedFiles.map((file, i) => (
                  <Col key={i} xs="4">
                    <div className="position-relative rounded-2 overflow-hidden border">
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="img-fluid"
                        style={{
                          width: "100%",
                          height: "90px",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-light position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: 22, height: 22 }}
                        onClick={() => removeFile(i)}
                        title="Remove Image"
                      >
                        <i
                          className="ri-close-line text-danger"
                          style={{ fontSize: 14 }}
                        />
                      </button>
                    </div>
                    <small
                      className="d-block text-truncate mt-1"
                      title={file.name}
                    >
                      {file.name}
                    </small>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Card>
      </Col>

      {/* Right: Video (col-12 on mobile, col-6 on md+) */}
      <Col xs="12" md="6">
        <Card className="shadow-sm border-0 p-3 h-100">
          <h6 className="text-muted mb-3">Video (Single)</h6>

          {/* Video Upload */}
          <Dropzone
            onDrop={handleAcceptedVideo}
            accept={{ "video/*": [] }}
            multiple={false}
          >
            {({ getRootProps, getInputProps }) => (
              <div
                className="dropzone dz-clickable rounded-3"
                {...getRootProps()}
              >
                <div className="dz-message needsclick text-center p-3">
                  <i className="ri-video-add-line fs-1 text-muted mb-2" />
                  <h6 className="mb-0">Drop a video here or click to upload</h6>
                  <small className="text-muted">
                    Only one video can be attached.
                  </small>
                </div>
                <input {...getInputProps()} />
              </div>
            )}
          </Dropzone>

          {/* Video Preview */}
          <div className="mt-3">
            {selectedVideo ? (
              <div className="position-relative rounded-3 overflow-hidden border">
                <video
                  src={selectedVideo.preview}
                  controls
                  style={{
                    width: "100%",
                    maxHeight: "220px",
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 p-0 d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 24, height: 24 }}
                  onClick={removeVideo}
                  title="Remove Video"
                >
                  <i
                    className="ri-close-line text-danger"
                    style={{ fontSize: 16 }}
                  />
                </button>
              </div>
            ) : (
              <p className="text-muted mb-0 small">
                No video uploaded yet.
              </p>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  </>
);

export default AttachmentTabContent;
