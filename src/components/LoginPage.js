import React from "react";
import {start} from "../utils/supercanvas"

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    start();
  }

  render() {
    return(
    <div>
      <canvas/>
      <div className="login-wrapper">
        <hgroup className="heading">
          <h1 className="major">[tenant text]</h1>
        </hgroup>

        <form className="sign-up">
          <h1 className="sign-up-title">Ingresar</h1>
          <input type="text" className="sign-up-input" placeholder="e-mail" autoFocus/>
          <input type="password" className="sign-up-input" placeholder="password"/>
          <input type="submit" value="Iniciar sesión" className="sign-up-button"/>
        </form>
      </div>
    </div>
    )
  }
}

export default LoginPage;
