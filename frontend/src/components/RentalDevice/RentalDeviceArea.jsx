import React from "react";
import { Container, Row, Col } from "reactstrap";
import { useGetRentalDeviceListQuery } from "@/redux/features/rentalDeviceApi";
import RentalDeviceItem from "./RentalDeviceItem"; // adjust path

const RentalDeviceArea = () => {
  const { data: devices = [], isLoading, isError } = useGetRentalDeviceListQuery();

  return (
    <section className="pt-60 pb-60">
      <Container>
        <div className="text-center mb-5">
          <h2 className="fw-bold">Rental Devices</h2>
          <p className="text-muted">Choose device for rent</p>
        </div>

        {isLoading && (
          <div className="text-center py-5">
            <h5>Loading devices...</h5>
          </div>
        )}

        {isError && (
          <div className="text-center text-danger py-5">
            <h5>Failed to load devices</h5>
          </div>
        )}

        {!isLoading && devices.length === 0 && (
          <div className="text-center py-5">
            <h5>No rental devices available</h5>
          </div>
        )}

        <Row>
          {devices.map((device) => (
            <Col key={device.rental_device_id} xl={3} lg={4} md={6} sm={12}>
              <RentalDeviceItem device={device} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default RentalDeviceArea;    