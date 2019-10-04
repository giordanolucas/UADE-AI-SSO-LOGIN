import React from "react";
import {
  getInputValue,
  initializeTenantAndRedirectFromQueryString,
} from "../utils/Functions";
import axios from "axios";
import {SSO_URL} from "../api/ApiConfig";

const DEFAULT_STATE = { email: null, emptyFields: false, invalidEmail: false, makingRequest: false };

class ForgotPasswordPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = initializeTenantAndRedirectFromQueryString(DEFAULT_STATE);
  }

  handleInputChange = (event) => {
    this.setState({
      ...this.state,
      [event.target.name]: getInputValue(event)
    });
  };

  validateForm = () => {
    let stateChange = { emptyFields: false, invalidEmail: false, makingRequest: false };

    if(!this.state.email){
      stateChange.emptyFields = true;
    }

    if(!this.validateEmail(this.state.email)){
      stateChange.invalidEmail = true;
    }

    let makeRequest = !stateChange.emptyFields && !stateChange.invalidEmail;

    if(makeRequest){
      stateChange.makingRequest = true;
    }

    this.setState({...this.state, ...stateChange});

    return makeRequest;
  };

  getRequestConfig = () => {
    return {
      headers: {
        'Content-Type' : 'application/json',
        'TENANT-ID' : this.state.tenantId
      }
    };
  };

  recoverPassword = () => {
    if(this.state.makingRequest || !this.validateForm()){
      return;
    }

    let recoverPasswordData = {
      email: this.state.email
    };

    axios.post(SSO_URL + '/password/forgot', recoverPasswordData, this.getRequestConfig())
        .then(response => {
          this.setState({...this.state, requestError: false, makingRequest: false });
          window.location.replace("message" +
              "?tenant=" + this.state.tenantId +
              "&redirect=" + this.state.redirectUri +
              "&message=Si el email ingresado es correcto recibirá un mail. Por favor revise su casilla.");
        })
        .catch(() => {
          this.setState({...this.state, requestError: true, makingRequest: false});
        });
  };

  validateEmail = (email) => {
    let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  render() {

    console.log(this.state);

    let buttonClass = "btn btn-primary btn-lg " +
        (this.state.makingRequest ? "progress-bar progress-bar-striped progress-bar-animated" : "");

    let buttonStyle = { width: '100%' };

    return(
        <div>
          <div className="login-wrapper">
            <hgroup className="heading">
              <h1 className="major">{this.state.title}</h1>
            </hgroup>

            <form className="sign-up" action="javascript:0" autoComplete="off">
              <h1 className="sign-up-title">Recuperar Password</h1>
              <input autoComplete="new-password" name="email" type="text" className="form-control mb-3 form-control-lg" placeholder="email" onChange={this.handleInputChange}/>

              {this.state.requestError && <div className="mb-2"><span className="text-danger">No fue posible recuperar el password</span></div>}
              {this.state.emptyFields && <div className="mb-2"><span className="text-danger">Debe completar todos los campos</span></div>}
              {this.state.invalidEmail && <div className="mb-2"><span className="text-danger">El email ingresado no es válido</span></div>}
              <input type="submit" style={buttonStyle} value="Recuperar" className={buttonClass} onClick={this.recoverPassword}/>
              <div className="mt-2"><a href={"/login?tenant=" + this.state.tenantId + "&redirect=" + this.state.redirectUri}>Volver</a></div>
            </form>

          </div>
        </div>
    )
  }

}

export default ForgotPasswordPage;
