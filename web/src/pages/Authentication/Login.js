import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  FormFeedback,
  Alert,
  Spinner,
} from 'reactstrap';
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

// Formik + Yup
import * as Yup from "yup";
import { useFormik } from "formik";

// Actions
import { loginUser, socialLogin, resetLoginFlag } from "../../store/actions";

// Logo
import logoLight from "../../assets/images/logo-light.png";

// HOC
import withRouter from '../../Components/Common/withRouter';
import { createSelector } from 'reselect';
import { ToastContainer, toast } from 'react-toastify';

// ✅ Google OAuth
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Login = (props) => {
  const dispatch = useDispatch();

  const selectLayoutState = (state) => state.Account;
  const selectLayoutProperties = createSelector(
    selectLayoutState,
    (layout) => ({
      user: layout.user,
      errorMsg: layout.errorMsg,
      loading: layout.loading,
      error: layout.error,
    })
  );

  const { user, errorMsg, loading, error } = useSelector(selectLayoutProperties);

  const [passwordShow, setPasswordShow] = useState(false);

  // ========== MANUAL LOGIN (Formik) ==========
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      user_email: "",
      user_password: "",
    },
    validationSchema: Yup.object({
      user_email: Yup.string().required("Please Enter Your Email"),
      user_password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
      // 👇 MANUAL LOGIN ONLY
      dispatch(loginUser(values, props.router.navigate));
    },
  });

  // ========== GOOGLE LOGIN (Separate function) ==========
  const googleLogin = useGoogleLogin({
    flow: "implicit", // default, but added for clarity
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;

        // 1️⃣ Get user response from Google
        const response   = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

      
        dispatch(
          socialLogin(
            response,
            props.router.navigate
          )
        );

        
      } catch (err) {
        console.error("Error in Google social login:", err);
        toast.error("Failed to login with Google.");
      }
    },
    onError: (err) => {
      console.error("Google SignIn Error:", err);
      toast.error("Google login failed. Try again!");
    },
  });

  // ✅ Reset error messages automatically
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        dispatch(resetLoginFlag());
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [dispatch, error]);

  document.title = "Login | CRM Dashboard";

  return (
    <React.Fragment>
      <ParticlesAuth>
        <div className="auth-page-content">
          <ToastContainer limit={1} autoClose={800} />
          <Container>
            <Row>
              <Col lg={12}>
                <div className="text-center mt-sm-5 mb-4 text-white-50">
                  <div>
                    <Link to="/" className="d-inline-block auth-logo">
                      <img src={logoLight} alt="Logo" height="20" />
                    </Link>
                  </div>
                  <p className="mt-3 fs-15 fw-medium">Welcome to CRM Dashboard</p>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <Card className="mt-4">
                  <CardBody className="p-4">
                    <div className="text-center mt-2">
                      <h5 className="text-primary">Welcome Back!</h5>
                      <p className="text-muted">Sign in to continue.</p>
                    </div>

                    {errorMsg ? <Alert color="danger">{errorMsg}</Alert> : null}

                    <div className="p-2 mt-4">
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                      >
                        {/* ======= Manual Email/Password Login ======= */}
                        <div className="mb-3">
                          <Label htmlFor="user_email" className="form-label">
                            Email
                          </Label>
                          <Input
                            id="user_email"
                            name="user_email"
                            className="form-control"
                            placeholder="Enter email"
                            type="email"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.user_email || ""}
                            invalid={
                              validation.touched.user_email &&
                              validation.errors.user_email
                                ? true
                                : false
                            }
                          />
                          {validation.touched.user_email &&
                          validation.errors.user_email ? (
                            <FormFeedback type="invalid">
                              {validation.errors.user_email}
                            </FormFeedback>
                          ) : null}
                        </div>

                        <div className="mb-3">
                          <div className="float-end">
                            <Link
                              to="/forgot-password"
                              className="text-muted"
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <Label
                            className="form-label"
                            htmlFor="user_password"
                          >
                            Password
                          </Label>
                          <div className="position-relative auth-pass-inputgroup mb-3">
                            <Input
                              id="user_password"
                              name="user_password"
                              value={validation.values.user_password || ""}
                              type={passwordShow ? "text" : "password"}
                              className="form-control pe-5"
                              placeholder="Enter Password"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              invalid={
                                validation.touched.user_password &&
                                validation.errors.user_password
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.user_password &&
                            validation.errors.user_password ? (
                              <FormFeedback type="invalid">
                                {validation.errors.user_password}
                              </FormFeedback>
                            ) : null}
                            <button
                              className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                              type="button"
                              id="password-addon"
                              onClick={() => setPasswordShow(!passwordShow)}
                            >
                              <i className="ri-eye-fill align-middle"></i>
                            </button>
                          </div>
                        </div>

                        <div className="form-check">
                          <Input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            id="auth-remember-check"
                          />
                          <Label
                            className="form-check-label"
                            htmlFor="auth-remember-check"
                          >
                            Remember me
                          </Label>
                        </div>

                        <div className="mt-4">
                          <Button
                            color="success"
                            disabled={loading}
                            className="btn btn-success w-100"
                            type="submit"
                          >
                            {loading && (
                              <Spinner size="sm" className="me-2">
                                Loading...
                              </Spinner>
                            )}
                            Sign In
                          </Button>
                        </div>

                        {/* ======= Divider / Or continue with ======= */}
                        <div className="mt-4 text-center">
                          <div className="signin-other-title">
                            <h5 className="fs-13 mb-4 title text-muted">
                              Or continue with
                            </h5>
                          </div>

                          {/* ======= Google Login Button (Separate) ======= */}
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
                                {/* Google icon SVG */}
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
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="fw-semibold text-primary text-decoration-underline"
                    >
                      Signup
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

export default withRouter(Login);
