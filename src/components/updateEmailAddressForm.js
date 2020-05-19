import React, { useContext, useEffect, useState } from "react";
// TODO: import PropTypes from "prop-types";
import auth from "./auth";

import { Button, Form, Header, Segment } from "semantic-ui-react";

import { AuthContext } from "../context/authContext";

import EmailInput from "./formFields/emailInput";

import useForm from "../hooks/useForm";

const UpdateEmailAddressForm = props => {
  const { formTitle, submitBtnContent, submitRedirect, submitRedirectURL } = props;

  const [initialValues, setInitialValues] = useState({});
  const [isError, setIsError] = useState(false);
  const [isInitialValuesSet, setIsInitalValuesSet] = useState(false);
  const [userId, setUserId] = useState(null);

  const {
    errors,
    handleBlur,
    handleChange,
    handleServerErrors,
    initializeFields,
    values
  } = useForm();

  const context = useContext(AuthContext);
  const token = context.authTokens;
  const setDoRedirect = context.setDoRedirect;
  const setRedirectURL = context.setRedirectURL;

  const userInfo = auth.getUserInfo(token);
  useEffect(() => { setUserId(userInfo.user) }, [userInfo.user]);

  useEffect(() => {
    const getUserAccount = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/account/id/${userId}`);
      const data = await response.json();

      if (data && data.user) { // Skips the destructuring if any of these are null, which would throw a type error
        const {
          user: {
            email
          },
        } = data;

        setInitialValues({
          email
        });
      }
    }
    getUserAccount();
  }, [userId]);

  useEffect(() => {
    Object.values(errors).indexOf(true) > -1 ? setIsError(true) : setIsError(false);
  }, [errors]);

  if(Object.keys(initialValues).length > 0 && !isInitialValuesSet) {
    initializeFields(initialValues);
    setIsInitalValuesSet(true);
  }

  const handleSubmit = () => {
    if (!isError) {
      postUpdate();
      // TODO: return success
    } else {
      // TODO: return failure
    }
  }
  
  const postUpdate = () => {
    const { email } = values;
    const formData = { userId, email };

    fetch(`${process.env.REACT_APP_API_URL}/api/users/email/update`, {
      method: "put",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.errors) {
        const { errors } = data;
        handleServerErrors(...errors);
      } else {
        if(submitRedirect) {
          setRedirectURL(submitRedirectURL);
          setDoRedirect(true);
        }
      }
    })
    .catch(error => {
      return ({
        errorCode: 500,
        errorMsg: "Internal Server Error",
        errorDetail: error
      })
    });
  }

  return(
    <>
      <Header 
        as="h2" 
        textAlign="center"
        color="grey"
      >
        {formTitle}
      </Header>
      <Segment>
        <Form size="large">
          <EmailInput 
            errors={errors}
            initialValue={values.email}
            placeholder="Email Address"
            handleBlur={handleBlur}
            handleChange={handleChange}
            values={values}
          />
          <Button
            disabled={isError}
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
    </>
  );
}

// TODO: Add prop type checking
// TODO: Add default props

export default UpdateEmailAddressForm;
