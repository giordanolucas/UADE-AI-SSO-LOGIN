import React from "react";
import {
    Route,
    Switch,
    Redirect,
    BrowserRouter as Router
} from "react-router-dom";
import LoginPage from "./LoginPage";
import LogoutPage from "./LogoutPage";
import SignUpPage from "./SignUpPage";
import ErrorPage from "./ErrorPage";
import {startCanvas} from "../utils/supercanvas";

class App extends React.Component {

    componentDidMount() {
        startCanvas();
    }

    render() {
        return (
            <div id="app">
                <Router>
                    <Switch>
                        <Route path="/login" component={LoginPage}/>
                        <Route path="/logout" component={LogoutPage}/>
                        <Route path="/signup" component={SignUpPage}/>
                        <Route path="/error" component={ErrorPage}/>
                        <Redirect to="/login"/>
                    </Switch>
                </Router>
                <canvas/>
            </div>
        )
    }
}

export default App;
