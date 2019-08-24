import React from "react";
import {getInputValue, parseQuery} from "../utils/Functions";
import axios from "axios";
import {SSO_URL} from "../api/ApiConfig";
import jwtDecode from "jwt-decode";
import lscache from "lscache";

const DEFAULT_STATE = {fullName: null, email: null, password: null, repeat: null, emptyFields: false, invalidEmail: false, passNotMatch: false, signUpError: false, signingUp: false };

class SignUpPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initializeFromQuery(DEFAULT_STATE);
  }

  initializeFromQuery = (state) => {
    let query = parseQuery(this.props.location.search);
    let tenant = query.tenant;
    let redirect = query.redirect;

    if(!tenant || !redirect){
      window.location.replace("error?error=La URL de login debe incluír tenant y redirect");
    }

    return { ...state, tenantId: tenant, redirectUri: redirect};
  };

  handleInputChange = (event) => {
    this.setState({
      ...this.state,
      [event.target.name]: getInputValue(event)
    });
  };

  validateSignUp = () => {
    let stateChange = {emptyFields: false, invalidEmail: false, passNotMatch: false };

    if(this.isEmpty(this.state.email) || this.isEmpty(this.state.password) || this.isEmpty(this.state.repeat) || this.isEmpty(this.state.fullName)){
      stateChange.emptyFields = true;
    }

    if(!this.validateEmail(this.state.email)){
      stateChange.invalidEmail = true;
    }

    if(this.state.password !== this.state.repeat){
      stateChange.passNotMatch = true;
    }

    this.setState({...this.state, ...stateChange});

    return !stateChange.emptyFields && !stateChange.invalidEmail && !stateChange.passNotMatch;
  };

  getRequestConfig = () => {
    return {
      headers: {
        'Content-Type' : 'application/json',
        'TENANT-ID' : this.state.tenantId
      }
    };
  };

  signUp = () => {
    if(!this.validateSignUp()){
      return;
    }

    let signUpData = {
      email: this.state.email,
      password: this.state.password,
      fullName: this.state.fullName
    };

    this.setState({ ...this.state, signingUp: true});

    axios.post(SSO_URL + '/signup', signUpData, this.getRequestConfig())
        .then(response => {
          this.setState({...this.state, signUpError: false, signingUp: false });
          this.handleTokenResponse(response.data.token);
        })
        .catch(() => {
          this.setState({...this.state, signUpError: true, signingUp: false});
        });

  };

  handleTokenResponse = (encodedToken) => {
    let jsonToken = jwtDecode(encodedToken);
    let expireDate = 0;
    if(jsonToken["exp"]){
      expireDate = new Date(jsonToken["exp"] * 1000);
    }

    let expireTime = 0;
    if(expireDate > 0){
      expireTime = expireDate - new Date();
    }

    lscache.set(this.state.tenantId, encodedToken, expireTime);
    window.location.replace(this.state.redirectUri + "#" + encodedToken);
  };

  validateEmail = (email) => {
    let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  isEmpty = (string) => {
    return !string;
  };

  render() {

    let registerButtonClass = "btn btn-primary btn-lg " +
        (this.state.signingUp ? "progress-bar progress-bar-striped progress-bar-animated" : "");

    let registerButtonStyle = { width: '100%' };

    return(
        <div>
          <div className="login-wrapper">
            <hgroup className="heading">
              <h1 className="major">{this.state.title}</h1>
            </hgroup>

            <form className="sign-up" action="javascript:0" autoComplete="off">
              <h1 className="sign-up-title">Registrarme</h1>
              <input autoComplete="new-password" name="fullName" type="text" className="form-control mb-3 form-control-lg" placeholder="nombre completo" autoFocus onChange={this.handleInputChange}/>
              <input autoComplete="new-password" name="email" type="text" className="form-control mb-3 form-control-lg" placeholder="email" onChange={this.handleInputChange}/>
              <input autoComplete="new-password" name="password" type="password" className="form-control mb-3 form-control-lg" placeholder="password" onChange={this.handleInputChange}/>
              <input autoComplete="new-password" name="repeat" type="password" className="form-control mb-3 form-control-lg" placeholder="repeat password" onChange={this.handleInputChange}/>

              {this.state.signUpError && <div className="mb-2"><span className="text-danger">No fue posible registrarse</span></div>}
              {this.state.emptyFields && <div className="mb-2"><span className="text-danger">Debe completar todos los campos</span></div>}
              {this.state.invalidEmail && <div className="mb-2"><span className="text-danger">El email ingresado no es válido</span></div>}
              {this.state.passNotMatch && <div className="mb-2"><span className="text-danger">Los passwords deben coincidir</span></div>}
              <input type="submit" style={registerButtonStyle} value="Registrarme" className={registerButtonClass} onClick={this.signUp}/>
              <div className="mt-2"><a href={"/login?tenant=" + this.state.tenantId + "&redirect=" + this.state.redirectUri}>Ya estoy registrado</a></div>
            </form>

          </div>
        </div>
    )
  }

}

export default SignUpPage;
