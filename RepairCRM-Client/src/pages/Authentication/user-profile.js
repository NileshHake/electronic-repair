import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import avatar from "../../assets/images/users/avatar-1.jpg";
import { editProfile, resetProfileFlag } from "../../store/actions";
import { createSelector } from "reselect";

const UserProfile = () => {
  const dispatch = useDispatch();

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("Admin");

  const selectLayoutState = (state) => state.Profile;
  const userprofileData = createSelector(selectLayoutState, (userpro) => ({
    user: userpro.user,
    success: userpro.success,
    error: userpro.error,
  }));

  const { user, success, error } = useSelector(userprofileData);

  // ✅ Load user data from sessionStorage (JWT response format)
  useEffect(() => {
    const authUser = sessionStorage.getItem("authUser");

    if (authUser) {
      const parsed = JSON.parse(authUser);

      if (!isEmpty(user)) {
        // Update local session if Redux updated user data
        parsed.user.user_name = user.user_name;
        sessionStorage.setItem("authUser", JSON.stringify(parsed));
      }

      setUserName(parsed.user.user_name || "Admin");
      setUserEmail(parsed.user.user_email || "admin@gmail.com");
      setUserId(parsed.user.user_id || parsed.user.id || "1");

      setTimeout(() => {
        dispatch(resetProfileFlag());
      }, 3000);
    }
  }, [dispatch, user]);

  // ✅ Formik validation setup
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      user_name: userName || "Admin",
      user_id: userId || "",
    },
    validationSchema: Yup.object({
      user_name: Yup.string().required("Please enter your name"),
    }),
    onSubmit: (values) => {
      dispatch(editProfile(values));
    },
  });

  document.title = "Profile | Velzon - React Admin & Dashboard Template";

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col lg="12">
            {error && <Alert color="danger">{error}</Alert>}
            {success && (
              <Alert color="success">Username updated to {userName}</Alert>
            )}

            <Card>
              <CardBody>
                <div className="d-flex">
                  <div className="mx-3">
                    <img
                      src={avatar}
                      alt=""
                      className="avatar-md rounded-circle img-thumbnail"
                    />
                  </div>
                  <div className="flex-grow-1 align-self-center">
                    <div className="text-muted">
                      <h5>{userName}</h5>
                      <p className="mb-1">Email Id: {userEmail}</p>
                      <p className="mb-0">Id No: #{userId}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <h4 className="card-title mb-4">Change User Name</h4>

        <Card>
          <CardBody>
            <Form
              className="form-horizontal"
              onSubmit={(e) => {
                e.preventDefault();
                validation.handleSubmit();
                return false;
              }}
            >
              <div className="form-group">
                <Label className="form-label">User Name</Label>
                <Input
                  name="user_name"
                  className="form-control"
                  placeholder="Enter User Name"
                  type="text"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.user_name || ""}
                  invalid={
                    validation.touched.user_name &&
                    validation.errors.user_name
                      ? true
                      : false
                  }
                />
                {validation.touched.user_name &&
                validation.errors.user_name ? (
                  <FormFeedback type="invalid">
                    {validation.errors.user_name}
                  </FormFeedback>
                ) : null}

                <Input
                  name="user_id"
                  value={userId}
                  type="hidden"
                />
              </div>

              <div className="text-center mt-4">
                <Button type="submit" color="danger">
                  Update User Name
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default UserProfile;
