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

function App() {
    return (
        <div id="app">
            <Router>
                <Switch>
                    <Route path="/login" component={LoginPage}/>
                    <Route path="/logout" component={LogoutPage}/>
                    <Route path="/signup" component={SignUpPage}/>
                    <Redirect to="/login"/>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
