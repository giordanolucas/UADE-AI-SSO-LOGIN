import React from "react";
import {initializeTenantAndRedirectFromQueryString, parseQuery} from "../utils/Functions";

class MessagePage extends React.Component {
  constructor(props) {
    super(props);
    let query = parseQuery(this.props.location.search);
    debugger;
    this.state = initializeTenantAndRedirectFromQueryString({message: query.message});
  }

  render() {
    return(
      <div className="error-wrapper">

        <div className="error">
          <h1 className="error-title">Información</h1>
          <span>{this.state.message}</span>

          <div className="mt-4"><a href={"/login?tenant=" + this.state.tenantId + "&redirect=" + this.state.redirectUri}>Volver</a></div>
        </div>

      </div>
    )
  }
}

export default MessagePage;
