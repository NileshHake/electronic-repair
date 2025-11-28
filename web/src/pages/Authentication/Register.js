import React, { useEffect } from "react";
import {
  Row,
  Col,
  CardBody,
  Card,
  Alert,
  Container,
  Input,
  Label,
  Form,
  FormFeedback,
} from "reactstrap";

import * as Yup from "yup";
import { useFormik } from "formik";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { registerUser, apiError, resetRegisterFlag } from "../../store/actions";

import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { createSelector } from "reselect";

// ✅ New Google OAuth hook
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Register = () => {
  const history = useNavigate();
  const dispatch = useDispatch(); 
  // ---------- FORM (Formik + Yup) ----------
  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      user_email: "",
      user_name: "",
      user_phone_number: "",
      user_password: "",
      confirm_password: "",
    },

    validationSchema: Yup.object().shape({
      user_email: Yup.string()
        .email("Please enter a valid email address")
        .required("Please enter your email"),
      user_name: Yup.string().required("Please enter your username"),
      user_phone_number: Yup.string().required(
        "Please enter your phone number"
      ),
      user_password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirm_password: Yup.string()
        .oneOf(
          [Yup.ref("user_password"), null],
          "Password and Confirm Password must match"
        )
        .required("Confirm password is required"),
    }),

    onSubmit: (values) => {
      dispatch(registerUser(values));
    },
  });

  // ---------- REDUX SELECTORS ----------
  const selectLayoutState = (state) => state.Account;
  const registerData = createSelector(selectLayoutState, (accountState) => ({
    registrationError: accountState.registrationError,
    success: accountState.success,
    error: accountState.error,
  }));

  const { registrationError, success, error } = useSelector(registerData);

  useEffect(() => {
    dispatch(apiError(""));
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast("Your Redirect To Login Page...", {
        position: "top-right",
        hideProgressBar: false,
        className: "bg-success text-white",
        progress: undefined,
        toastId: "",
      });
      setTimeout(() => history("/dashbord"), 1000);
    }

    const timer = setTimeout(() => {
      dispatch(resetRegisterFlag());
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch, success, error, history]);

  document.title = "SignUp | CRM";

  // ---------- GOOGLE LOGIN (new way) ----------
  const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try { 
      const accessToken = tokenResponse.access_token;

      // ✅ Get user info from Google
      const res = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
 
      validation.setValues({
        ...validation.values,
        user_email: res.email || "",
        user_password: res.email || "",
        user_name: res.name || "",
      });
 
      dispatch(
        registerUser(res)
      );

      toast.success(`Welcome ${res.name}!`, {
        position: "top-right",
      });
    } catch (err) {
      console.error("Error fetching Google user info:", err);
      toast.error("Failed to fetch Google profile.");
    }
  },
  onError: (err) => {
    console.error("Google SignIn Error:", err);
    toast.error("Google login failed. Try again!");
  },
});


  return (
    <React.Fragment>
      <ParticlesAuth>
        <div className="auth-page-content">
          <Container>
            <Row>
              <Col lg={12}>
                <div className="text-center mt-sm-5 mb-4 text-white-50">
                  <div>
                    <Link to="/" className="d-inline-block auth-logo">
                      <img src={logoLight} alt="" height="20" />
                    </Link>
                  </div>
                  <p className="mt-3 fs-15 fw-medium">
                    Premium Admin & Dashboard Template
                  </p>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <Card className="mt-4">
                  <CardBody className="p-4">
                    <div className="text-center mt-2">
                      <h5 className="text-primary">Create New Account</h5>
                      <p className="text-muted">
                        Get your free velzon account now
                      </p>
                    </div>

                    <div className="p-2 mt-4">
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                        className="needs-validation"
                        noValidate
                      >
                        {/* Toast Container */}
                        <ToastContainer autoClose={2000} limit={1} />

                        {/* Success */}
                        {success && (
                          <Alert color="success">
                            Register User Successfully and You will be
                            redirected to Login Page...
                          </Alert>
                        )}

                        {/* Error */}
                        {error && (
                          <Alert color="danger">
                            <div>
                              {registrationError ||
                                "Email has been registered before, please use another email address..."}
                            </div>
                          </Alert>
                        )}

                        {/* Email */}
                        <div className="mb-3">
                          <Label htmlFor="user_email" className="form-label">
                            Email <span className="text-danger">*</span>
                          </Label>
                          <Input
                            id="user_email"
                            name="user_email"
                            className="form-control"
                            placeholder="Enter email address"
                            type="email"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.user_email || ""}
                            invalid={
                              !!(
                                validation.touched.user_email &&
                                validation.errors.user_email
                              )
                            }
                          />
                          {validation.touched.user_email &&
                            validation.errors.user_email && (
                              <FormFeedback type="invalid">
                                {validation.errors.user_email}
                              </FormFeedback>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="mb-3">
                          <Label
                            htmlFor="user_phone_number"
                            className="form-label"
                          >
                            Phone Number <span className="text-danger">*</span>
                          </Label>
                          <Input
                            id="user_phone_number"
                            name="user_phone_number"
                            type="text"
                            placeholder="Enter phone number"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.user_phone_number || ""}
                            invalid={
                              !!(
                                validation.touched.user_phone_number &&
                                validation.errors.user_phone_number
                              )
                            }
                          />
                          {validation.touched.user_phone_number &&
                            validation.errors.user_phone_number && (
                              <FormFeedback type="invalid">
                                {validation.errors.user_phone_number}
                              </FormFeedback>
                            )}
                        </div>

                        {/* Username */}
                        <div className="mb-3">
                          <Label htmlFor="user_name" className="form-label">
                            Username <span className="text-danger">*</span>
                          </Label>
                          <Input
                            id="user_name"
                            name="user_name"
                            type="text"
                            placeholder="Enter username"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.user_name || ""}
                            invalid={
                              !!(
                                validation.touched.user_name &&
                                validation.errors.user_name
                              )
                            }
                          />
                          {validation.touched.user_name &&
                            validation.errors.user_name && (
                              <FormFeedback type="invalid">
                                {validation.errors.user_name}
                              </FormFeedback>
                            )}
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                          <Label htmlFor="user_password" className="form-label">
                            Password <span className="text-danger">*</span>
                          </Label>
                          <Input
                            id="user_password"
                            name="user_password"
                            type="password"
                            placeholder="Enter Password"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.user_password || ""}
                            invalid={
                              !!(
                                validation.touched.user_password &&
                                validation.errors.user_password
                              )
                            }
                          />
                          {validation.touched.user_password &&
                            validation.errors.user_password && (
                              <FormFeedback type="invalid">
                                {validation.errors.user_password}
                              </FormFeedback>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-2">
                          <Label
                            htmlFor="confirm_password"
                            className="form-label"
                          >
                            Confirm Password{" "}
                            <span className="text-danger">*</span>
                          </Label>
                          <Input
                            id="confirm_password"
                            name="confirm_password"
                            type="password"
                            placeholder="Confirm Password"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.confirm_password || ""}
                            invalid={
                              !!(
                                validation.touched.confirm_password &&
                                validation.errors.confirm_password
                              )
                            }
                          />
                          {validation.touched.confirm_password &&
                            validation.errors.confirm_password && (
                              <FormFeedback type="invalid">
                                {validation.errors.confirm_password}
                              </FormFeedback>
                            )}
                        </div>

                        <div className="mb-4">
                          <p className="mb-0 fs-12 text-muted fst-italic">
                            By registering you agree to the NBH Helth Soft{" "}
                            <Link
                              to="#"
                              className="text-primary text-decoration-underline fst-normal fw-medium"
                            >
                              Terms of Use
                            </Link>
                          </p>
                        </div>

                        <div className="mt-4">
                          <button
                            className="btn btn-success w-100"
                            type="submit"
                          >
                            Sign Up
                          </button>
                        </div>

                        {/* GOOGLE LOGIN */}
                        <div className="mt-4 text-center">
                          <div className="signin-other-title">
                            <h5 className="fs-13 mb-4 title text-muted">
                              Or continue with
                            </h5>
                          </div>

                          <div className="d-grid mt-3">
                            <button
                              type="button"
                              onClick={() => googleLogin()}
                              className="btn btn-light btn-lg d-flex align-items-center justify-content-center gap-2 border"
                              style={{
                                maxHeight: "40px",
                                borderRadius: "8px",
                              }}
                            >
                              <div
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  backgroundColor: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 48 48"
                                  width="20"
                                  height="20"
                                >
                                  <path
                                    fill="#FFC107"
                                    d="M43.6 20.5H42V20H24v8h11.3C33.7 31.9 29.3 35 24 35c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 3.1 29.6 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.1-2.3-.4-3.5z"
                                  />
                                  <path
                                    fill="#FF3D00"
                                    d="M6.3 14.7l6.6 4.8C14.4 15.3 18.8 13 24 13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 3.1 29.6 1 24 1 15.3 1 7.8 5.5 3.6 12.4l2.7 2.3z"
                                  />
                                  <path
                                    fill="#4CAF50"
                                    d="M24 45c5.2 0 10.2-1.9 13.9-5.4L32.7 35c-2.4 1.8-5.4 3-8.7 3-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C7.8 40.5 15.3 45 24 45z"
                                  />
                                  <path
                                    fill="#1976D2"
                                    d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.6-6.3 7.1l5.2 4.6C37.4 37.1 41 31.8 41 24c0-1.3-.1-2.3-.4-3.5z"
                                  />
                                </svg>
                              </div>
                              <span className="fw-semibold">
                                Continue with Google
                              </span>
                            </button>
                          </div>
                        </div>
                      </Form>
                    </div>
                  </CardBody>
                </Card>

                <div className="mt-4 text-center">
                  <p className="mb-0">
                    Already have an account ?{" "}
                    <Link
                      to="/login"
                      className="fw-semibold text-primary text-decoration-underline"
                    >
                      Signin
                    </Link>
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </ParticlesAuth>
    </React.Fragment>
  );
};

export default Register;
