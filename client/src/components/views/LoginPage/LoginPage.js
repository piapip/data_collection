import React, { useState } from "react";
import { withRouter, Link } from "react-router-dom";
import { loginUser } from "../../../_actions/user_actions";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Grid, TextField, Button, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from "react-redux";

const useStyle = makeStyles(() => ({
  root: {
    "& .MuiFormControl-root": {
      minWidth: '400px',
    }
  },
}));

function LoginPage(props) {

  const GridItemStyle = {
    marginBottom: "20px",
  };

  const ErrorStyle = {
    marginTop: "5px",
  };

  const SubmitButtonStyle = {
    textAlign: "center",
    // width: "100%",
  };
  
  const dispatch = useDispatch();
  const classes = useStyle();
  
  const rememberMeChecked = localStorage.getItem("rememberMe") ? true : false;

  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [rememberMe, setRememberMe] = useState(rememberMeChecked)

  const handleRememberMe = () => {
    setRememberMe(!rememberMe)
  };

  props.setupSocket()

  const initialEmail = localStorage.getItem("rememberMe") ? localStorage.getItem("rememberMe") : '';

  return (
    <Formik
      initialValues={{
        email: initialEmail,
        password: '',
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            email: values.email,
            password: values.password
          };

          dispatch(loginUser(dataToSubmit))
            .then(response => {
              if (response.payload.loginSuccess) {
                window.localStorage.setItem('userId', response.payload.userId);
                if (rememberMe === true) {
                  window.localStorage.setItem('rememberMe', values.id);
                } else {
                  localStorage.removeItem('rememberMe');
                }
                props.history.push("/");
              } else {
                setFormErrorMessage('Sai email hoặc mật khẩu!')
              }
            })
            .catch(err => {
              setFormErrorMessage('Sai email hoặc mật khẩu!')
              setTimeout(() => {
                setFormErrorMessage("")
              }, 3000);
            });
          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          // dirty,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
          // handleReset,
        } = props;
        return (
          <div className="app">

            {/* <Title level={2}>Log In</Title> */}
            <h1>Log in</h1>
            <form className={classes.root} onSubmit={handleSubmit}>
              <Grid container justify="center" style={{display: "block"}}>
                <Grid item style={GridItemStyle}>
                  <TextField
                    variant="outlined"
                    label="Email"
                    id="email"
                    placeholder="Email của bạn"
                    type="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.confirmPassword && touched.confirmPassword ? 'text-input error' : 'text-input'
                    }/>
                    {errors.email && touched.email && (
                      <div className="input-feedback" style={ErrorStyle}>{errors.email}</div>
                    )}
                </Grid>

                <Grid item style={GridItemStyle}>
                  <TextField
                    variant="outlined"
                    label="Password"
                    id="password"
                    placeholder="Nhập mật khẩu"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.password && touched.password ? 'text-input error' : 'text-input'
                    }/>
                    {errors.password && touched.password && (
                      <div className="input-feedback" style={ErrorStyle}>{errors.password}</div>
                    )}
                </Grid>

                <FormControlLabel label="Remember me" 
                  control={
                    <Checkbox id="rememberMe" color="primary" onChange={handleRememberMe} checked={rememberMe} />  
                  }/>
                <Grid item style={SubmitButtonStyle}>
                  {formErrorMessage && (
                    <label ><p style={{ color: '#ff0000bf', fontSize: '0.7rem', border: '1px solid', padding: '1rem', borderRadius: '10px' }}>{formErrorMessage}</p></label>
                  )}
                  <Button onClick={handleSubmit} color="primary" variant="contained" disabled={isSubmitting} style={{width: "100%"}}>
                    Login
                  </Button>
                </Grid>
                Hoặc <Link to="/register">đăng ký ngay!</Link>
              </Grid>
            </form>
          </div>
        );
      }}
    </Formik>
  );
};

export default withRouter(LoginPage);


