export async function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export async function getUser() {
  return localStorage.getItem("user");
}

export async function deleteUser() {
  localStorage.removeItem("user");
}
