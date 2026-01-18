import { useEffect, useState } from "react";
import HelloWorld from "./Hello";
import { useBackendStatus } from "./context/BackendContext";

function App() {
  const [message, setMessage] = useState("Loading...");
  const { isConnected } = useBackendStatus();

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-800 font-[Roboto]">
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">
          Frontend React
        </h1>
        <p className="text-lg mb-8 text-slate-600">
          Backend says:{" "}
          <span
            className={`font-semibold transition-all duration-500 ${
              isConnected
              ? "text-blue-500 px-1"
              : "bg-red-400/20 rounded-md text-red-500 animate-pulse italic px-1"
            }`}
          >
            {message}
          </span>
        </p>

        <div className="text-lg">
          <HelloWorld />
        </div>
      </div>
    </div>
  );
}

export default App;



