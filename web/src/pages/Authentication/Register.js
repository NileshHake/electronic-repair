import React, { useEffect, useState } from "react";
import {
    Row,
    Col,
    CardBody,
    Card,
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
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import Select from "react-select";

// Actions
import { registerUser, apiError, resetRegisterFlag } from "../../store/actions";
import { getBusinessesList } from "../../store/Business";

import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";

const Register = () => {
    const history = useNavigate();
    const dispatch = useDispatch();
    const [isGoogleLogin, setIsGoogleLogin] = useState(false);

    // Fetch business list
    const { businesses } = useSelector((state) => state.BusinessReducer);

    useEffect(() => {
        dispatch(getBusinessesList());
    }, [dispatch]);

    // ======= VALIDATION SCHEMA (depends on isGoogleLogin) =======
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email("Please enter a valid email")
            .required("Email is required"),

        first_name: Yup.string().required("Username is required"),

        phone_number: isGoogleLogin
            ? Yup.string().notRequired()
            : Yup.string()
                .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
                .required("Phone number is required"),

        password: isGoogleLogin
            ? Yup.string().notRequired()
            : Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("Password is required"),

        confirm_password: isGoogleLogin
            ? Yup.string().notRequired()
            : Yup.string()
                .oneOf([Yup.ref("password")], "Passwords must match")
                .required("Confirm Password is required"),


    });

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: "",
            first_name: "",
            phone_number: "",
            password: "",
            confirm_password: "",
            business_id: "",
        },
        validationSchema,
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
        },
    });

    const { registrationError, success, error } = useSelector(
        (state) => state.Account
    );

    useEffect(() => {
        dispatch(apiError(""));
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success("Registered Successfully! Redirecting to Login...", {
                position: "top-right",
            });
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
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );

                const { email, name } = response;

                // Mark as Google login so password is optional
                setIsGoogleLogin(true);

                const payload = {
                    user_name: name,
                    user_email: email,
                };

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
                                        <p className="text-muted">
                                            Get your free Velzon account now
                                        </p>
                                    </div>

                                    <div className="p-2 mt-4">
                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                validation.handleSubmit();
                                            }}
                                        >
                                            {/* Username */}
                                            <div className="mb-3">
                                                <Label>
                                                    Username <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    name="first_name"
                                                    type="text"
                                                    placeholder="Enter username"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.first_name}
                                                    invalid={
                                                        !!(
                                                            validation.touched.first_name &&
                                                            validation.errors.first_name
                                                        )
                                                    }
                                                />
                                                {validation.touched.first_name &&
                                                    validation.errors.first_name ? (
                                                    <FormFeedback>
                                                        {validation.errors.first_name}
                                                    </FormFeedback>
                                                ) : null}
                                            </div>

                                            {/* Email */}
                                            <div className="mb-3">
                                                <Label>
                                                    Email <span className="text-danger">*</span>
                                                </Label>
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    placeholder="Enter email"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.email}
                                                    invalid={
                                                        !!(
                                                            validation.touched.email &&
                                                            validation.errors.email
                                                        )
                                                    }
                                                />
                                                {validation.touched.email &&
                                                    validation.errors.email ? (
                                                    <FormFeedback>
                                                        {validation.errors.email}
                                                    </FormFeedback>
                                                ) : null}
                                            </div>

                                            {/* Phone Number */}
                                            <div className="mb-3">
                                                <Label>
                                                    Phone Number
                                                    {!isGoogleLogin && (
                                                        <span className="text-danger"> *</span>
                                                    )}
                                                </Label>
                                                <Input
                                                    name="phone_number"
                                                    type="text"
                                                    placeholder="Enter phone number"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.phone_number}
                                                    invalid={
                                                        !!(
                                                            validation.touched.phone_number &&
                                                            validation.errors.phone_number
                                                        )
                                                    }
                                                />
                                                {validation.touched.phone_number &&
                                                    validation.errors.phone_number ? (
                                                    <FormFeedback>
                                                        {validation.errors.phone_number}
                                                    </FormFeedback>
                                                ) : null}
                                            </div>

                                            {/* Select Business */}
                                            <div className="mb-3">
                                                <Label>
                                                    Select Business <span className="text-danger">*</span>
                                                </Label>
                                                <Select
                                                    name="business_id"
                                                    options={businesses.map((b) => ({
                                                        value: b.user_id,
                                                        label: b.user_name,
                                                    }))}
                                                    onChange={(selectedOption) => {
                                                        validation.setFieldValue(
                                                            "business_id",
                                                            selectedOption ? selectedOption.value : ""
                                                        );
                                                    }}
                                                    onBlur={() =>
                                                        validation.setFieldTouched("business_id", true)
                                                    }
                                                    value={
                                                        businesses
                                                            .map((b) => ({
                                                                value: b.user_id,
                                                                label: b.user_name,
                                                            }))
                                                            .find(
                                                                (option) =>
                                                                    option.value === validation.values.business_id
                                                            ) || null
                                                    }
                                                    placeholder="-- Select Business --"
                                                />
                                                {validation.touched.business_id &&
                                                    validation.errors.business_id ? (
                                                    <div className="text-danger mt-1">
                                                        {validation.errors.business_id}
                                                    </div>
                                                ) : null}
                                            </div>

                                            {/* Password fields only when NOT Google login */}
                                            {!isGoogleLogin && (
                                                <>
                                                    {/* Password */}
                                                    <div className="mb-3">
                                                        <Label>
                                                            Password <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            name="password"
                                                            type="password"
                                                            placeholder="Enter password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.password}
                                                            invalid={
                                                                !!(
                                                                    validation.touched.password &&
                                                                    validation.errors.password
                                                                )
                                                            }
                                                        />
                                                        {validation.touched.password &&
                                                            validation.errors.password ? (
                                                            <FormFeedback>
                                                                {validation.errors.password}
                                                            </FormFeedback>
                                                        ) : null}
                                                    </div>

                                                    {/* Confirm Password */}
                                                    <div className="mb-3">
                                                        <Label>
                                                            Confirm Password{" "}
                                                            <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            name="confirm_password"
                                                            type="password"
                                                            placeholder="Confirm password"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.confirm_password}
                                                            invalid={
                                                                !!(
                                                                    validation.touched.confirm_password &&
                                                                    validation.errors.confirm_password
                                                                )
                                                            }
                                                        />
                                                        {validation.touched.confirm_password &&
                                                            validation.errors.confirm_password ? (
                                                            <FormFeedback>
                                                                {validation.errors.confirm_password}
                                                            </FormFeedback>
                                                        ) : null}
                                                    </div>
                                                </>
                                            )}

                                            {/* Submit */}
                                            <div className="mt-4">
                                                <button
                                                    className="btn btn-success w-100"
                                                    type="submit"
                                                >
                                                    Sign Up
                                                </button>
                                            </div>

                                            {/* Google Login */}
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
                                                    <span className="fw-semibold">
                                                        Continue with Google
                                                    </span>
                                                </button>
                                            </div>
                                        </Form>
                                    </div>
                                </CardBody>
                            </Card>

                            <div className="mt-4 text-center">
                                <p className="mb-0">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="fw-semibold text-primary text-decoration-underline"
                                    >
                                        Sign In
                                    </Link>
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
