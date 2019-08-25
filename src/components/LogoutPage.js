import React from "react";
import lscache from "lscache";
import {initializeTenantAndRedirectFromQueryString, parseQuery} from "../utils/Functions";

class LogoutPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = initializeTenantAndRedirectFromQueryString({});
  }

  componentDidMount() {
    lscache.remove(this.state.tenantId);
    window.location.replace(this.state.redirectUri);
  }

  render() {
    return <></>
  }
}

export default LogoutPage;
