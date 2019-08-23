import React from "react";
import {start} from "../utils/supercanvas"
import {getInputValue, parseQuery} from "../utils/Functions";
import axios from 'axios';
import {SSO_URL} from "../api/ApiConfig";

const DEFAULT_STATE = {email: null, password: null};

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = DEFAULT_STATE;
  }

  componentDidMount() {
    start();
    let query = parseQuery(this.props.location.search);
    let tenant = query.tenant;
    let redirect = query.redirect;

    if(!tenant || !redirect){
      alert("tenant and redirect query params must be present");
    }

    this.setState({...this.state, tenantId: tenant, redirectUri: redirect});
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
    let requestConfig = this.getRequestConfig();

    axios.post(SSO_URL + '/login', loginData, requestConfig)
        .then(response => {
          this.setState({...this.state, token: response.data.token, error: false });
          window.location.replace(this.state.redirectUri + "#" + this.state.token);
        })
        .catch(() => {
          this.setState({...this.state, error: true});
        });
  };

  handleChange = (event) => {
    this.setState({
      ...this.state,
      [event.target.name]: getInputValue(event)
    });
  };

  render() {
    return(
    <div>
      <canvas/>
      <div className="login-wrapper">
        <hgroup className="heading">
          <h1 className="major">[tenant text]</h1>
        </hgroup>

        <div className="sign-up">
          <h1 className="sign-up-title">Ingresar</h1>
          {this.state.error && <div>ERROR INICIANDO SESION</div>}
          <input name="email" type="text" className="sign-up-input" placeholder="e-mail" autoFocus onChange={this.handleChange}/>
          <input name="password" type="password" className="sign-up-input" placeholder="password" onChange={this.handleChange}/>
          <input type="submit" value="Iniciar sesión" className="sign-up-button" onClick={this.login}/>
        </div>
      </div>
    </div>
    )
  }
}

export default LoginPage;
