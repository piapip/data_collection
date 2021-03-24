import React from "react";
import moment from "moment";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { registerUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";

import { Grid, TextField, RadioGroup, Radio, FormControl, FormLabel, FormControlLabel, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyle = makeStyles(() => ({
  root: {
    "& .MuiFormControl-root": {
      minWidth: '400px',
    }
  },
}));

function RegisterPage(props) {

  const GridItemStyle = {
    marginBottom: "20px",
  };

  const ErrorStyle = {
    marginTop: "5px",
  };

  const SubmitButtonStyle = {
    textAlign: "center",
  };

  const dispatch = useDispatch();
  const classes = useStyle();

  return (

    <Formik
      initialValues={{
        email: '',
        sex: 1,
        name: '',
        password: '',
        confirmPassword: ''
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .required('Name is required'),
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required')
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          let dataToSubmit = {
            email: values.email,
            sex: values.sex,
            password: values.password,
            name: values.name,
            lastname: values.lastname,
            image: `http://gravatar.com/avatar/${moment().unix()}?d=identicon`
          };

          dispatch(registerUser(dataToSubmit)).then(response => {
            if (response.payload.success) {
              props.history.push("/login");
            } else {
              alert(response.payload.err.errmsg)
            }
          })

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
            <h2>Sign up</h2>
            <form className={classes.root} onSubmit={handleSubmit}>
              <Grid container justify="center" style={{display: "block"}}>
                <Grid item style={GridItemStyle}>
                  <TextField
                    variant="outlined"
                    label="Tên"
                    id="name"
                    placeholder="Họ và tên"
                    value={values.name}
                    type="text"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.name && touched.name ? 'text-input error' : 'text-input'
                    }/>
                    {errors.name && touched.name && (
                      <div className="input-feedback" style={ErrorStyle}>{errors.name}</div>
                    )}                    
                </Grid>

                <FormControl component="fieldset">
                  <FormLabel component="legend">Giới tính</FormLabel>
                  <RadioGroup row
                    id="sex"
                    value={values.sex} 
                    onChange={handleChange("sex")}
                    onBlur={handleBlur}
                    >
                    <FormControlLabel value="1" control={<Radio />} label="Nam" />
                    <FormControlLabel value="2" control={<Radio />} label="Nữ" />

                  </RadioGroup>
                </FormControl>

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
                      errors.email && touched.email ? 'text-input error' : 'text-input'
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

                <Grid item style={GridItemStyle}>
                  <TextField
                    variant="outlined"
                    label="Xác nhận mật khẩu"
                    id="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.confirmPassword && touched.confirmPassword ? 'text-input error' : 'text-input'
                    }/>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <div className="input-feedback" style={ErrorStyle}>{errors.confirmPassword}</div>
                    )}
                </Grid>

                <Grid item style={SubmitButtonStyle}>
                  <Button onClick={handleSubmit} color="primary" variant="contained" disabled={isSubmitting} style={{width: "100%"}}>
                    Sign up
                  </Button>
                </Grid>
              </Grid>
            </form>
          </div>
        );
      }}
    </Formik>
  );
};


export default RegisterPage
