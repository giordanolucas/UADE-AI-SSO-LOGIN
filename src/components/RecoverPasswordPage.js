import React from "react";
import {
  parseQuery,
  getInputValue
} from "../utils/Functions";
import axios from "axios";
import { SSO_URL } from "../api/ApiConfig";

class ForgotPasswordPage extends React.Component {
  constructor(props) {
    super(props);
    let query = parseQuery(window.location.search);
    let tenant = query.tenant;
    let id = query.id;
    
    this.state = {...this.state, tenantId: tenant, id: id};
  }

  handleInputChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: getInputValue(event)
    });
  };

  validateForm = () => {
    let stateChange = { emptyFields: false, makingRequest: false };

    if (!this.state.password) {
      stateChange.emptyFields = true;
    }

    let makeRequest = !stateChange.emptyFields;

    if (makeRequest) {
      stateChange.makingRequest = true;
    }

    this.setState({ ...this.state, ...stateChange });

    return makeRequest;
  };

  getRequestConfig = () => {
    return {
      headers: {
        "Content-Type": "application/json",
        "TENANT-ID": this.state.tenantId
      }
    };
  };

  recoverPassword = () => {
    if (this.state.makingRequest || !this.validateForm()) {
      return;
    }

    let recoverPasswordData = {
      id: this.state.id,
      password: this.state.password
    };

    axios
      .put(
        SSO_URL + "/password/forgot",
        recoverPasswordData,
        this.getRequestConfig()
      )
      .then(() => {
        this.setState({
          ...this.state,
          requestError: false,
          makingRequest: false
        });
        alert("ok");
      })
      .catch(() => {
        this.setState({
          ...this.state,
          requestError: true,
          makingRequest: false
        });
        alert("no ok");
      });
  };

  render() {
    let buttonClass =
      "btn btn-primary btn-lg " +
      (this.state.makingRequest
        ? "progress-bar progress-bar-striped progress-bar-animated"
        : "");

    let buttonStyle = { width: "100%" };

    return (
      <div>
        <div className="login-wrapper">
          <hgroup className="heading">
            <h1 className="major">{this.state.title}</h1>
          </hgroup>

          <form className="sign-up" action="javascript:0" autoComplete="off">
            <h1 className="sign-up-title">Recuperar Password</h1>
            <input
              autoComplete="new-password"
              name="password"
              type="text"
              className="form-control mb-3 form-control-lg"
              placeholder="password"
              onChange={this.handleInputChange}
            />

            {this.state.requestError && (
              <div className="mb-2">
                <span className="text-danger">
                  No fue posible recuperar el password
                </span>
              </div>
            )}
            {this.state.emptyFields && (
              <div className="mb-2">
                <span className="text-danger">
                  Debe completar todos los campos
                </span>
              </div>
            )}
            {this.state.invalidEmail && (
              <div className="mb-2">
                <span className="text-danger">
                  El email ingresado no es válido
                </span>
              </div>
            )}
            <input
              type="submit"
              style={buttonStyle}
              value="Recuperar"
              className={buttonClass}
              onClick={this.recoverPassword}
            />
            <div className="mt-2">
              <a
                href={
                  "/login?tenant=" +
                  this.state.tenantId +
                  "&redirect=" +
                  this.state.redirectUri
                }
              >
                Volver
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default ForgotPasswordPage;
