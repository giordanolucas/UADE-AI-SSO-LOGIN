import lscache from "lscache";
import jwtDecode from "jwt-decode";

const BASE_SSO_URL = "https://uade-sso-login.herokuapp.com";
const LOCALSTORAGE_USER_KEY = "sso_user";
const LOCALSTORAGE_TOKEN_KEY = "sso_token";

function _getLoginUrl(tenantId, redirectUri){
    return BASE_SSO_URL + "/login?tenant=" + tenantId + "&redirect=" + redirectUri;
}

function _getLogoutUrl(tenantId, redirectUri){
    return BASE_SSO_URL + "/logout?tenant=" + tenantId + "&redirect=" + redirectUri;
}

function _saveUserToken(encodedToken){
    let jsonToken = jwtDecode(encodedToken);

    let expireDate = 0;
    if(jsonToken["exp"]){
        expireDate = new Date(jsonToken["exp"] * 1000);
    }

    let expireTime = 0;
    if(expireDate > 0){
        expireTime = expireDate - new Date();
    }

    lscache.set(LOCALSTORAGE_USER_KEY, jsonToken, expireTime);
    lscache.set(LOCALSTORAGE_TOKEN_KEY, encodedToken, expireTime);
}

export function login(tenantId, callbackUrl){
    window.location.replace(_getLoginUrl(tenantId, callbackUrl));
}

export function saveUserToken(){
    _saveUserToken(window.location.hash.substring(1));
}

export function getEncodedToken(){
    return lscache.get(LOCALSTORAGE_TOKEN_KEY);
}

export function getTokenData(){
    return lscache.get(LOCALSTORAGE_USER_KEY);
}

export function logOut(tenantId, callbackUrl){
    window.location.replace(_getLogoutUrl(tenantId, callbackUrl));
}