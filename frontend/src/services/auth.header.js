export default function authHeader() {
  // -> extragem token-ul din localStorage
  let user = JSON.parse(localStorage.getItem("tokenResponse"));

  // -> verificam ca obiectul are tipul corect
  if (user && user.token) {
    // -> returnam obiectul cu proprietarea { Authorization: token } de care are nevoie API-ul
    return { Authorization: user.token };
  } else {
    return {};
  }
}
