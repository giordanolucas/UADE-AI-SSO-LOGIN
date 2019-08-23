import React from "react";
import {startCanvas} from "../utils/supercanvas"
import {getInputValue, parseQuery} from "../utils/Functions";
import axios from 'axios';
import {MANAGEMENT_URL, SSO_URL} from "../api/ApiConfig";

const DEFAULT_STATE = {email: null, password: null, title: "Apps Interactivas SSO", createUsers: false, loggingIn: false};

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initializeFromQuery(DEFAULT_STATE);
  }

  initializeFromQuery = (state) => {
    let query = parseQuery(this.props.location.search);
    let tenant = query.tenant;
    let redirect = query.redirect;

    return {...state, tenantId: tenant, redirectUri: redirect};
  };

  componentDidMount() {
    startCanvas();

    axios.get(MANAGEMENT_URL + '/Public/loginSettings', this.getRequestConfig())
        .then(response => {
          this.setState({...this.state, title: response.data.loginText, createUsers: !!response.data.allowPublicUsers });
        })
        .catch(() => {
          this.setState({...this.state, invalidTenant: true});
        });
  }

  disabled = () => {
    return this.state.email != null && this.state.password != null;
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
    let loginData = { email: this.state.email, password: this.state.password };

    this.setState({ ...this.state, loggingIn: true});

    axios.post(SSO_URL + '/login', loginData, this.getRequestConfig())
        .then(response => {
          this.setState({...this.state, token: response.data.token, error: false, loggingIn: false });
          window.location.replace(this.state.redirectUri + "#" + this.state.token);
        })
        .catch(() => {
          this.setState({...this.state, error: true, loggingIn: false});
        });
  };

  handleChange = (event) => {
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
      <canvas/>
      <div className="login-wrapper">
        <hgroup className="heading">
          <h1 className="major">{this.state.title}</h1>
        </hgroup>

        <form className="sign-up" action="javascript:void(0);">
          <h1 className="sign-up-title">Ingresar</h1>
          <input name="email" type="text" className="form-control mb-3 form-control-lg" placeholder="e-mail" autoFocus onChange={this.handleChange}/>
          <input name="password" type="password" className="form-control mb-3 form-control-lg" placeholder="password" onChange={this.handleChange}/>
          {this.state.error && <div className="mb-2"><span className="text-danger">Inicio de sesión incorrecto</span></div>}
          <input type="submit" style={loginButtonStyle} value="Iniciar sesión" className={loginButtonClass} onClick={this.login}/>
          <div className="mt-2">{this.state.createUsers && <a href="#">Registrarme</a>}</div>
        </form>

      </div>
    </div>
    )
  }
}

export default LoginPage;
