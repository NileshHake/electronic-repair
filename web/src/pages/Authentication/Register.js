import React, { useEffect, useState } from "react";
import { Row, Col, CardBody, Card, Alert, Container, Input, Label, Form, FormFeedback } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import Select from "react-select";
// Actions
import { registerUser, apiError, resetRegisterFlag } from "../../store/actions";

import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { getBusinessesList } from "../../store/Business";

const Register = () => {
    const history = useNavigate();
    const dispatch = useDispatch();
    const [isGoogleLogin, setIsGoogleLogin] = useState(false);

    // Fetch business list
    const { businesses } = useSelector((state) => state.BusinessReducer);
    useEffect(() => {
        dispatch(getBusinessesList());
    }, [dispatch]);

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: '',
            first_name: '',
            phone_number: '',
            password: '',
            confirm_password: '',
            business_id: '',
        },
        validationSchema: Yup.object().shape({
            email: Yup.string().email('Please enter a valid email').required('Email is required'),
            first_name: Yup.string().required('Username is required'),
            phone_number: Yup.string().when([], {
                is: () => !isGoogleLogin, // only required if not Google login
                then: Yup.string()
                    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
                    .required('Phone number is required'),
                otherwise: Yup.string().notRequired()
            }),
            password: Yup.string().when([], {
                is: () => !isGoogleLogin,
                then: Yup.string()
                    .min(6, 'Password must be at least 6 characters')
                    .required('Password is required'),
                otherwise: Yup.string().notRequired()
            }),
            confirm_password: Yup.string().when('password', {
                is: (val) => val && !isGoogleLogin,
                then: Yup.string()
                    .oneOf([Yup.ref('password')], 'Passwords must match')
                    .required('Confirm Password is required'),
                otherwise: Yup.string().notRequired()
            }),
            business_id: Yup.string().required('Business is required')
        }),

        onSubmit: (values) => {
            const payload = {
                user_name: values.first_name,
                user_email: values.email,
                user_phone_number: values.phone_number,
                user_type: 6,
                user_password: isGoogleLogin ? null : values.password,
                // ✅ Business ID logic
                user_created_by: values.business_id ? values.business_id : 1,
            };
            dispatch(registerUser(payload, history));
        }

    });

    const { registrationError, success, error } = useSelector(state => state.Account);

    useEffect(() => {
        dispatch(apiError(""));
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success("Registered Successfully! Redirecting to Login...", { position: "top-right" });
            setTimeout(() => history("/login"), 3000);
        }
        setTimeout(() => dispatch(resetRegisterFlag()), 3000);
    }, [dispatch, success, history]);

    // ✅ Google OAuth Login
    const googleLogin = useGoogleLogin({
        flow: "implicit",
        onSuccess: async (tokenResponse) => {
            try {
                const accessToken = tokenResponse.access_token;
                const response = await axios.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                const { email, name } = response;
                const payload = {
                    user_name: name,
                    user_email: email,
                }
                dispatch(registerUser(payload, history));



            } catch (err) {
                console.error("Google login error:", err);
                toast.error("Failed to login with Google.");
            }
        },
        onError: (err) => {
            console.error("Google SignIn Error:", err);
            toast.error("Google login failed. Try again!");
        },
    });

    document.title = "Sign Up | Velzon";

    return (
        <ParticlesAuth>
            <div className="auth-page-content">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5}>
                            <Card className="mt-4">
                                <CardBody className="p-4">
                                    <div className="text-center mt-2">
                                        <h5 className="text-primary">Create New Account</h5>
                                        <p className="text-muted">Get your free Velzon account now</p>
                                    </div>

                                    <div className="p-2 mt-4">
                                        <Form onSubmit={e => { e.preventDefault(); validation.handleSubmit(); }}>
                                            {/* 
                                            {success && <Alert color="success">Registered Successfully! Redirecting to Login...</Alert>}
                                            {error && <Alert color="danger">Email already registered. Please use another email.</Alert>} */}

                                            <div className="mb-3">
                                                <Label>Username <span className="text-danger">*</span></Label>
                                                <Input
                                                    name="first_name"
                                                    type="text"
                                                    placeholder="Enter username"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.first_name}
                                                    invalid={validation.touched.first_name && validation.errors.first_name}
                                                />
                                                <FormFeedback>{validation.errors.first_name}</FormFeedback>
                                            </div>

                                            <div className="mb-3">
                                                <Label>Email <span className="text-danger">*</span></Label>
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    placeholder="Enter email"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.email}
                                                    invalid={validation.touched.email && validation.errors.email}
                                                />
                                                <FormFeedback>{validation.errors.email}</FormFeedback>
                                            </div>

                                            <div className="mb-3">
                                                <Label>Phone Number <span className="text-danger">*</span></Label>
                                                <Input
                                                    name="phone_number"
                                                    type="text"
                                                    placeholder="Enter phone number"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.phone_number}
                                                    invalid={validation.touched.phone_number && validation.errors.phone_number}
                                                />
                                                <FormFeedback>{validation.errors.phone_number}</FormFeedback>
                                            </div>

                                            <div className="mb-3">
                                                <Label>Select Business <span className="text-danger">*</span></Label>
                                                <Select
                                                    name="business_id"
                                                    options={businesses.map(b => ({ value: b.user_id, label: b.user_name }))}
                                                    onChange={(selectedOption) => {
                                                        validation.setFieldValue("business_id", selectedOption ? selectedOption.value : "");
                                                    }}
                                                    onBlur={() => validation.setFieldTouched("business_id", true)}
                                                    value={businesses
                                                        .map(b => ({ value: b.user_id, label: b.user_name }))
                                                        .find(option => option.value === validation.values.business_id) || null
                                                    }
                                                    placeholder="-- Select Business --"
                                                />
                                                {validation.touched.business_id && validation.errors.business_id ? (
                                                    <div className="text-danger mt-1">{validation.errors.business_id}</div>
                                                ) : null}
                                                <FormFeedback>{validation.errors.business_id}</FormFeedback>
                                            </div>

                                            {!isGoogleLogin && <>
                                                <div className="mb-3">
                                                    <Label>Password <span className="text-danger">*</span></Label>
                                                    <Input
                                                        name="password"
                                                        type="password"
                                                        placeholder="Enter password"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.password}
                                                        invalid={validation.touched.password && validation.errors.password}
                                                    />
                                                    <FormFeedback>{validation.errors.password}</FormFeedback>
                                                </div>

                                                <div className="mb-3">
                                                    <Label>Confirm Password <span className="text-danger">*</span></Label>
                                                    <Input
                                                        name="confirm_password"
                                                        type="password"
                                                        placeholder="Confirm password"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.confirm_password}
                                                        invalid={validation.touched.confirm_password && validation.errors.confirm_password}
                                                    />
                                                    <FormFeedback>{validation.errors.confirm_password}</FormFeedback>
                                                </div>
                                            </>}

                                            <div className="mt-4">
                                                <button className="btn btn-success w-100" type="submit">Sign Up</button>
                                            </div>

                                            <div className="d-grid mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => googleLogin()}
                                                    className="btn btn-light btn-lg d-flex align-items-center justify-content-center gap-2 border"
                                                    style={{ maxHeight: "40px", borderRadius: "8px" }}
                                                >
                                                    <span className="fw-semibold">Continue with Google</span>
                                                </button>
                                            </div>
                                        </Form>
                                    </div>
                                </CardBody>
                            </Card>

                            <div className="mt-4 text-center">
                                <p className="mb-0">
                                    Already have an account? <Link to="/login" className="fw-semibold text-primary text-decoration-underline">Sign In</Link>
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
                <ToastContainer autoClose={2000} />
            </div>
        </ParticlesAuth>
    );
};

export default Register;
