import React from "react";
import lscache from "lscache";
import {parseQuery} from "../utils/Functions";

class LogoutPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initializeFromQuery();
  }

  initializeFromQuery = () => {
    let query = parseQuery(this.props.location.search);
    let tenant = query.tenant;
    let redirect = query.redirect;

    if(!tenant || !redirect){
      window.location.replace("error?error=La URL de login debe incluír tenant y redirect");
    }

    return { tenantId: tenant, redirectUri: redirect};
  };

  componentDidMount() {
    lscache.remove(this.state.tenantId);
    window.location.replace(this.state.redirectUri);
  }

  render() {
    return <></>
  }
}

export default LogoutPage;
