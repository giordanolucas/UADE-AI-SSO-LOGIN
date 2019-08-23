import React from "react";
import {parseQuery} from "../utils/Functions";

class ErrorPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initializeFromQuery();
  }

  initializeFromQuery = () => {
    let query = parseQuery(this.props.location.search);
    let error = query.error;

    return { error: error };
  };

  render() {
    return(
      <div className="error-wrapper">

        <div className="error">
          <h1 className="error-title">¡Ocurrió un error!</h1>
          <span>{this.state.error}</span>
        </div>
      </div>
    )
  }
}

export default ErrorPage;
