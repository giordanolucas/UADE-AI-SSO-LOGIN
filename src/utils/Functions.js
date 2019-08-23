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

export function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}
