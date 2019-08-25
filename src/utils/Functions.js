import jwtDecode from "jwt-decode";
import lscache from "lscache";

export function getInputValue(event) {
  const target = event.target;
  let value;

  if (event.isNumber === true) {
    value = parseInt(target.value);
  } else if (target.type === "checkbox") {
    value = target.checked;
  } else {
    value = target.value;
  }

  return value;
}

export function saveTokenAndRedirect(encodedToken, tenantId, redirectUri) {
  let jsonToken = jwtDecode(encodedToken);
  let expireDate = 0;
  if(jsonToken["exp"]){
    expireDate = new Date(jsonToken["exp"] * 1000);
  }

  let expireTime = 0;
  if(expireDate > 0){
    expireTime = expireDate - new Date();
  }

  lscache.set(tenantId, encodedToken, expireTime);
  window.location.replace(redirectUri + "#" + encodedToken);
}

export function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

export function initializeTenantAndRedirectFromQueryString(state) {
  let query = parseQuery(window.location.search);
  let tenant = query.tenant;
  let redirect = query.redirect;

  if(!tenant || !redirect){
    window.location.replace("error?error=La URL de login debe incluír tenant y redirect");
  }

  return {...state, tenantId: tenant, redirectUri: redirect};
}
