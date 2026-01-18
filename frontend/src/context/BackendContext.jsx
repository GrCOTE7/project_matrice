import React, { createContext, useContext, useState, useEffect } from "react";

const BackendContext = createContext({ isConnected: false });

export const useBackendStatus = () => useContext(BackendContext);

export const BackendProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws = null;
    let currentServerId = null;
    let reconnectTimeout = null;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/reload`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          if (currentServerId && currentServerId !== data.server_id) {
            window.location.reload();
          }
          currentServerId = data.server_id;
        } else if (data.type === "heartbeat") {
          if (currentServerId && data.server_id !== currentServerId) {
            window.location.reload();
          }
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 1000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return (
    <BackendContext.Provider value={{ isConnected }}>
      {children}
    </BackendContext.Provider>
  );
};
