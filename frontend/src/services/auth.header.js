export default function authHeader() {
  let user = JSON.parse(localStorage.getItem("tokenResponse"));

  // -> check this, make sure it's the right object
  if (user && user.token) {
    return { Authorization: user.token };
  } else {
    return {};
  }
}
