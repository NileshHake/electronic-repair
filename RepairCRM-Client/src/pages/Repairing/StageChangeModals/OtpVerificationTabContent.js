import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  resetOtpState,
  sendOtpAction,
  verifyOtpAction,
} from "../../../store/StageRemark";

const OtpVerificationTabContent = ({ isSelectedData, onConfirm }) => {
  const dispatch = useDispatch();
  const { sendOtpSuccess, verifyOtpSuccess, loading } = useSelector(
    (state) => state.OtpReducer
  );

  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0); // in seconds
  const [otp, setOtp] = useState(""); // 6-digit OTP string

  const phone = isSelectedData?.customer_phone_number;

  // Refs for each input
  const inputRefs = useRef([]);

  // Format countdown as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Send OTP via saga
  const handleSendOtp = () => {
    if (!phone) {
      toast.error("Phone number not found!");
      return;
    }
    dispatch(sendOtpAction(phone));
  };

  // When OTP send API is successful, start countdown and focus first input
  useEffect(() => {
    if (sendOtpSuccess) {
      setOtpSent(true);
      setCountdown(120); // 2 minutes
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [sendOtpSuccess]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(
        () => setCountdown((prev) => prev - 1),
        1000
      );
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle digit change + auto move to next
const handleChangeDigit = (index, value) => {
  if (!/^\d?$/.test(value)) return; // allow only one digit or empty

  const otpArray = otp.split("");

  // ensure length 6
  while (otpArray.length < 6) {
    otpArray.push("");
  }

  otpArray[index] = value;
  const newOtp = otpArray.join("");
  setOtp(newOtp);

  // Move to next input if value typed and not last index
  if (value && index < 5 && inputRefs.current[index + 1]) {
    inputRefs.current[index + 1].focus();
  }
};


  // Handle keyboard navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // if current empty and backspace -> move to previous
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }

    if (e.key === "ArrowRight" && index < 5) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleConfirm = () => {
  console.log("OTP =>", otp);

  // must be exactly 6 digits
  if (!/^\d{6}$/.test(otp)) {
    toast.error("Please enter 6-digit OTP");
    return;
  }
  if (!phone) {
    toast.error("Phone number not found!");
    return;
  }

  // This triggers verifyOtpSaga with payload { phone, otp }
  dispatch(verifyOtpAction(phone, otp));
};


  // On successful verification
  useEffect(() => {
    if (verifyOtpSuccess) {
      // Inform parent
      if (onConfirm) onConfirm();

      // Reset Redux OTP state
      dispatch(resetOtpState());

      // Reset local OTP fields
      setOtp("");
      setOtpSent(false);
      setCountdown(0);

      // Clear focus
      if (inputRefs.current[0]) {
        inputRefs.current[0].blur();
      }
    }
  }, [verifyOtpSuccess, dispatch, onConfirm]);

  return (
    <Row className="justify-content-center">
      <Col xs="auto" className="text-center">
        <Card className="mt-4" style={{ minWidth: "350px", maxWidth: "100%" }}>
          <CardBody className="p-4">
            <div className="mb-4 text-center">
              <div className="avatar-lg mx-auto">
                <div className="avatar-title bg-light text-primary display-5 rounded-circle">
                  <i className="ri-mail-line"></i>
                </div>
              </div>
            </div>

            <div className="p-2 mt-4">
              <div className="text-muted text-center mb-4">
                <h4>Verify Your Mobile</h4>
                <p>
                  Please enter the 6 digit code sent to{" "}
                  <span className="fw-semibold">
                    {isSelectedData?.customer_name} ({phone})
                  </span>
                </p>
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                <Row className="justify-content-center mb-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Col key={index} xs="2" className="text-center">
                      <input
                        type="text"
                        className="form-control form-control-lg bg-light border-light text-center"
                        maxLength="1"
                        value={otp[index] || ""}
                        onChange={(e) =>
                          handleChangeDigit(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        ref={(el) => (inputRefs.current[index] = el)}
                        style={{ fontSize: "1.5rem", fontWeight: "600" }}
                      />
                    </Col>
                  ))}
                </Row>

                {/* Send / Resend OTP Button */}
                <Button
                  color="primary"
                  className="w-100 mb-3"
                  onClick={handleSendOtp}
                  disabled={loading || countdown > 0}
                >
                  {!otpSent
                    ? "Send OTP"
                    : countdown > 0
                    ? `Resend OTP (${formatTime(countdown)})`
                    : "Resend OTP"}
                </Button>

                {/* Confirm OTP Button */}
                <Button
                  color="success"
                  className="w-100"
                  type="button"
                  onClick={handleConfirm}
                  disabled={!otpSent || loading}
                >
                  Confirm
                </Button>
              </form>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default OtpVerificationTabContent;
