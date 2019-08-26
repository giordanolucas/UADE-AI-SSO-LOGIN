import React from "react";
import {getInputValue, saveTokenAndRedirect, initializeTenantAndRedirectFromQueryString} from "../utils/Functions";
import axios from 'axios';
import {MANAGEMENT_URL, SSO_URL} from "../api/ApiConfig";
import lscache from "lscache";

const DEFAULT_STATE = {email: null, password: null, title: "Apps Interactivas SSO", allowCreateUsers: false, loggingIn: false, logInError: false};

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = initializeTenantAndRedirectFromQueryString(DEFAULT_STATE);
    lscache.setExpiryMilliseconds(1);
  }

  componentDidMount() {
    axios.get(MANAGEMENT_URL + '/Public/loginSettings', this.getRequestConfig())
        .then(response => {
          this.setState({...this.state, title: response.data.loginText, allowCreateUsers: !!response.data.allowPublicUsers });
        })
        .catch(() => {
          window.location.replace("error?error=No se pude recuperar la información del tenant: " + this.state.tenantId);
        });

    let existingToken = lscache.get(this.state.tenantId);
    if(existingToken){
      this.handleTokenResponse(existingToken);
    }
  }

  blockLogin = () => {
    return !this.state.email || !this.state.password || this.state.loggingIn;
  };

  getRequestConfig = () => {
    return {
        headers: {
        'Content-Type' : 'application/json',
        'TENANT-ID' : this.state.tenantId
      }
    };
  };

  login = () => {
    if(this.blockLogin()){
      console.log("Login blocked!");
      return;
    }

    let loginData = { email: this.state.email, password: this.state.password };

    this.setState({ ...this.state, loggingIn: true});

    axios.post(SSO_URL + '/login', loginData, this.getRequestConfig())
        .then(response => {
          this.setState({...this.state, logInError: false, loggingIn: false });
          this.handleTokenResponse(response.data.token);
        })
        .catch(() => {
          this.setState({...this.state, logInError: true, loggingIn: false});
        });
  };

  handleTokenResponse = (encodedToken) => {
    saveTokenAndRedirect(encodedToken, this.state.tenantId, this.state.redirectUri);
  };

  handleInputChange = (event) => {
    this.setState({
      ...this.state,
      [event.target.name]: getInputValue(event)
    });
  };

  render() {

    let loginButtonClass = "btn btn-primary btn-lg " +
        (this.state.loggingIn ? "progress-bar progress-bar-striped progress-bar-animated" : "");

    let loginButtonStyle = { width: '100%' };

    return(
    <div>
      <div className="login-wrapper">
        <hgroup className="heading">
          <h1 className="major">{this.state.title}</h1>
        </hgroup>

        <form className="sign-up" action="javascript:0">
          <h1 className="sign-up-title">Ingresar</h1>
          <input name="email" type="text" className="form-control mb-3 form-control-lg" placeholder="email" autoFocus onChange={this.handleInputChange}/>
          <input name="password" type="password" className="form-control mb-3 form-control-lg" placeholder="password" onChange={this.handleInputChange}/>
          {this.state.logInError && <div className="mb-2"><span className="text-danger">Inicio de sesión incorrecto</span></div>}
          <input type="submit" style={loginButtonStyle} value="Iniciar sesión" className={loginButtonClass} onClick={this.login}/>
          <div className="mt-2">{this.state.allowCreateUsers && <a href={"/signup?tenant=" + this.state.tenantId + "&redirect=" + this.state.redirectUri}>Registrarme</a>}</div>
        </form>

      </div>
    </div>
    )
  }
}

export default LoginPage;
