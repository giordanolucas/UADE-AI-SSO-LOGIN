import React from "react";
import {
    Route,
    Switch,
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
                </Switch>
            </Router>
            <div>
                <span>
                    asd
                </span>
            </div>
        </div>
    );
}

export default App;
