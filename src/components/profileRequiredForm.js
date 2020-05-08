import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import auth from "./auth";

import {
  Button,
  Form,
  Grid,
  Header,
  Message,
  Segment
} from "semantic-ui-react";

import { AuthContext } from "../context/authContext";

import ErrorContainer from "./errorContainer";
import FullnameInput from "./formFields/fullnameInput";
import GenderInput from "./formFields/genderInput";

import useForm from "../hooks/useForm";

const ProfileRequiredForm = props => {
  const { colWidth, formInstructions, formTitle, submitBtnContent, submitRedirect, submitRedirectURL } = props;

  const [flag, setFlag] = useState(true);
  const [initialValues, setInitialValues] = useState({});
  const [isError, setIsError] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const { errors, handleBlur, handleChange, handleServerErrors, initializeFields, values } = useForm();

  const context = useContext(AuthContext);
  const token = context.authTokens;
  const setDoRedirect = context.setDoRedirect;
  const setRedirectURL = context.setRedirectURL;

  const userInfo = auth.getUserInfo(token);

  useEffect(() => { setUserId(userInfo.user) }, [userInfo.user]);

  useEffect(() => {
    const getUserProfile = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/id/${userId}`);
      const data = await response.json();

      if (data && data.user) { // Skips the destructuring if any of these are null, which would throw a type error
        const { user: { firstName, lastName, gender }, } = data;
        const fullname = firstName || lastName ? `${firstName} ${lastName}` : "";
        
        setInitialValues({ fullname, gender });
      }
    }
    getUserProfile();
  }, [userId]);

  useEffect(() => {
    Object.values(errors).indexOf(true) > -1 ? setIsError(true) : setIsError(false);
  }, [errors]);

  if(Object.keys(initialValues).length > 0 && flag) {
    initializeFields(initialValues);
    setFlag(false);
  }

  const handleSubmit = () => {
    if (!isError) {
      postProfileRequired();
    } else {
      // TODO: return failure
    }
  }

  const postProfileRequired = () => {
    const { fullname, gender } = values;

    const formData = {
      userId,
      fullname, 
      gender,
    };

    fetch(`${process.env.REACT_APP_API_URL}/api/users/profile/update/required`, {
      method: "put",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    }).then(response => {
      return response.json();
    }).then(data => {
      if (data.errors) {
        const { errors } = data;
        errors.forEach(e => {
          // TODO: fix the errors to return the form name so we can just loop through with [name]: true
          // Update - use handleServerErrors and just set handleServerErrors(...errors)
          if(e["error"] === "IVN") {
            handleServerErrors({ fullname: true });
          }
          if(e["error"] === "IVG") {
            handleServerErrors({ gender: true });
          }
        }); 
      } else {
        if(submitRedirect) {
          setRedirectURL(submitRedirectURL);
          setDoRedirect(true);
        }
      }
    }).catch(error => {
      return ({
        errorCode: 500,
        errorMsg: "Internal Server Error",
        errorDetail: error
      })
    });
  }

  return(
    <Grid.Column width={colWidth}>
      <Header 
        as="h2" 
        textAlign="center"
        color="grey"
      >
        {formTitle}
      </Header>
      <Message>
        {formInstructions}
      </Message>
      <ErrorContainer
        // header={isErrorHeader}
        // message={isErrorMessage}
        // show={isError}
      />
      <Segment>
        <Form size="large"> 
          <FullnameInput 
            errors={errors}
            initialValue={values.fullname}
            placeholder="First and Last Name"
            handleBlur={handleBlur}
            handleChange={handleChange}
            values={values}
          />
          <GenderInput 
            errors={errors}
            initialValue={values.gender} 
            handleBlur={handleBlur}
            handleChange={handleChange}
            values={values}
          />
          <Button
            disabled={!values.fullname || !values.gender || isError}
            className="fluid"
            type="button"
            color="red"
            size="large"
            icon="check circle"
            labelPosition="left"
            content={submitBtnContent}
            onClick={handleSubmit}
          >
          </Button>
        </Form>
      </Segment>
    </Grid.Column>
  );
}

ProfileRequiredForm.defaultProps = {
  colWidth: 6,
  formInstructions: "Only your first name and last initial will be displayed to other users. Your gender is never shown.",
  formTitle: "Your Profile",
  submitBtnContent:"Update Profile",
  submitRedirect: true,
  submitRedirectURL: "/dashboard"
}

ProfileRequiredForm.propTypes = {
  colWidth: PropTypes.number,
  formInstructions: PropTypes.string,
  formTitle: PropTypes.string,
  submitBtnContent: PropTypes.string,
  submitRedirect: PropTypes.bool,
  submitRedirectURL: PropTypes.string
}

export default ProfileRequiredForm;
