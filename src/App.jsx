import { useEffect, useRef, useState } from "react";

function App() {
  const marketDataConnection = useRef(null);
  const chatConnection = useRef(null);

  const [assets, setAssets] = useState({});
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    marketDataConnection.current = new WebSocket("ws://localhost:8081");
    chatConnection.current = new WebSocket("ws://localhost:8080");

    marketDataConnection.current.onmessage = (event) => {
      const { name: asset, price } = JSON.parse(event.data).data;
      setAssets((prevAssets) => ({ ...prevAssets, [asset]: price }));
    };

    chatConnection.current.onmessage = (event) => {
      setMessages((prevMessages) =>
        [...prevMessages, JSON.parse(event.data).data].slice(-30)
      );
    };

    return () => {
      console.log("Closing connections");
      marketDataConnection.current.close();
      chatConnection.current.close();
    };
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          background: "#eee",
          height: "100%",
          padding: "20px",
          gap: 20,
        }}
      >
        <div style={{ background: "#FFF", flex: 1, padding: 20 }}>
          <div style={{ fontWeight: "bold" }}>Market Data</div>
          <div
            style={{
              paddingTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {Object.entries(assets).map(([asset, price]) => (
              <div key={asset}>
                {asset}: {Math.round(price * 100) / 100}
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#FFF", flex: 1, padding: 20 }}>
          <div style={{ fontWeight: "bold" }}>Chat</div>
          <div style={{ paddingTop: 20 }}>
            {messages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
