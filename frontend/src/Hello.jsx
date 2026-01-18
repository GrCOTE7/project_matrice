import React, { useEffect, useState } from "react";
import { useBackendStatus } from "./context/BackendContext";

const HelloWorld = () => {
  const [message, setMessage] = useState("");
  const { isConnected } = useBackendStatus();

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="px-6 py-4 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg text-white flex items-center justify-between">
      <p className="text-md">
        <span className="font-bold opacity-80">From "Hello.jsx"</span>:{" "}
        <span className="ml-1 italic text-blue-50/90">{message}</span>
      </p>
      <span
        className={`ml-4 px-2 py-0.5 rounded-md text-sm font-medium transition-all duration-300 ${
          isConnected
            ? "bg-green-400/20 text-green-400"
            : "bg-red-400/20 text-red-100"
        }`}
      >
        Backend: {isConnected ? "✅" : "❌"}
      </span>
    </div>
  );
};

export default HelloWorld;
