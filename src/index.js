import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./components/App";

import "./styles/bootstrap-lumen.css";
import "./styles/login.css";
import "./styles/index.css";

render(
    <div>
        <Router>
            <App />
        </Router>
    </div>
    ,
    document.getElementById("app")
);