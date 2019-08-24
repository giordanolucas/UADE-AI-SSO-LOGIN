import React from "react";
import {getInputValue, parseQuery} from "../utils/Functions";
import axios from 'axios';
import {MANAGEMENT_URL, SSO_URL} from "../api/ApiConfig";
import lscache from "lscache";
import jwtDecode from "jwt-decode";

const DEFAULT_STATE = {email: null, password: null, title: "Apps Interactivas SSO", allowCreateUsers: false, loggingIn: false, logInError: false};

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initializeFromQuery(DEFAULT_STATE);
    lscache.setExpiryMilliseconds(1);
  }

  initializeFromQuery = (state) => {
    let query = parseQuery(this.props.location.search);
    let tenant = query.tenant;
    let redirect = query.redirect;

    if(!tenant || !redirect){
      window.location.replace("error?error=La URL de login debe incluír tenant y redirect");
    }

    return {...state, tenantId: tenant, redirectUri: redirect};
  };

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
    return this.state.email == null || this.state.password == null || this.state.loggingIn;
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
