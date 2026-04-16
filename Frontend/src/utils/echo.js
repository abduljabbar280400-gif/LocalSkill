import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const token =
  localStorage.getItem("client_token") ||
  localStorage.getItem("freelancer_token");

const echo = new Echo({
  broadcaster: "reverb",
  key: "local",
  wsHost: "127.0.0.1",
  wsPort: 8080,
  forceTLS: false,
  disableStats: true,

  authEndpoint: "http://127.0.0.1:8000/api/broadcasting/auth",

  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  },
});

export default echo;