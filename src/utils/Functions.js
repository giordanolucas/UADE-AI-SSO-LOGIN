export function buildHandleInputChange(component) {
  return function(event) {
    const target = event.target;
    const name = target.name;
    let value;

    if (event.isNumber === true) {
      value = parseInt(target.value);
    } else if (target.type === "checkbox") {
      value = target.checked;
    } else {
      value = target.value;
    }

    component.setState({
      [name]: value
    });
  };
}
