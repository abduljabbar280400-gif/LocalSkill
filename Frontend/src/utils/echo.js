import Echo from "laravel-echo";
import Pusher from "pusher-js";
import api from "../services/api";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        api
          .post("/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => {
            callback(false, response.data);
          })
          .catch((error) => {
            callback(true, error);
          });
      },
    };
  },
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
  enabledTransports: ["ws", "wss"],
});

window.Echo = echo;

export const resetEcho = () => {
  if (echo && echo.connector) {
    echo.disconnect();
    echo.connect();
  }
};

export default echo;