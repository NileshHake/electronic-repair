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
import { ToastContainer } from 'react-toastify';

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

  // ✅ Formik setup
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
        
        
      dispatch(loginUser(values, props.router.navigate));
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
          <ToastContainer limit={1} autoClose={800}/>
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
