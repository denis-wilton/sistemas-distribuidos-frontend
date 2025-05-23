import { useCallback, useEffect, useRef, useState } from "react";
import { useAssetStore } from "./stores/AssetStore";
import Graphic from "./components/Graphic/Graphic";
import graphicManager from "./components/Graphic/GraphicManager";

function App() {
  const marketDataConnection = useRef(null);
  const chatConnection = useRef(null);

  const { assets, setAsset } = useAssetStore();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("Denis Azevedo");

  const [messages, setMessages] = useState([]);
  useEffect(() => {
    marketDataConnection.current = new WebSocket("ws://192.168.207.214:8081");
    chatConnection.current = new WebSocket("ws://192.168.207.214:8080");

    marketDataConnection.current.onmessage = (event) => {
      const { name: asset, price } = JSON.parse(event.data).data;
      setAsset(asset, price);
      graphicManager.saveHistory(asset, price);
    };

    chatConnection.current.onmessage = (event) => {
      setMessages((prevMessages) =>
        [...prevMessages, JSON.parse(event.data).data]
          .slice(-150)
          .filter(Boolean)
      );
    };

    return () => {
      console.log("Closing connections");
      marketDataConnection.current.close();
      chatConnection.current.close();
    };
  }, []);

  const sendMessage = useCallback(() => {
    if (!message) return;
    chatConnection.current.send(
      JSON.stringify({
        type: "message",
        data: {
          type: "user",
          message: message,
          name: name,
        },
      })
    );
    setMessage("");
  }, [message, name]);

  return (
    <>
      <div
        style={{
          display: "flex",
          background: "#222",
          height: "100%",
          padding: "20px",
          gap: 20,
        }}
      >
        <div
          style={{
            background: "#111",
            flex: 1,
            padding: 20,
            borderRadius: 10,
            color: "#FFF",
          }}
        >
          <div style={{ fontWeight: "bold" }}>Market Data</div>
          <div
            style={{
              paddingTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Graphic />
          </div>
        </div>
        <div
          style={{ background: "#222", flex: 1, padding: 20, color: "#FFF" }}
        >
          <div style={{ fontWeight: "bold" }}>Chat</div>
          <div
            style={{
              paddingTop: 20,
              display: "grid",
              gridTemplateRows: "1fr auto",
              gap: 5,
              height: "100%",
            }}
          >
            <div style={{ overflowY: "auto" }}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    color: message.type === "system" ? "gray" : "unset",
                    padding: 5,
                    borderRadius: 5,
                    background:
                      message.type === "system" ? "#ddd" : "transparent",
                  }}
                >
                  {message.type === "user" ? (
                    <>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: getVividColorFromName(message.name),
                          marginRight: 5,
                        }}
                      >
                        {message.name}:
                      </span>
                    </>
                  ) : null}
                  {message.message}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                height: "calc(40px + 0.5rem)",
                justifyContent: "space-between",
                background: "#222",
                padding: "0.5rem 0",
              }}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                style={{
                  border: "none",
                  borderRadius: 10,
                  background: "#333",
                  color: "white",
                  padding: 5,
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 10,
                  background: "#333",
                  color: "white",
                  padding: 5,
                  outline: "none",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                style={{
                  width: 100,
                  borderRadius: 10,
                  background: "#2e6f40",
                  color: "white",
                  border: "none",
                  transition: "background 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#3a8f52";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#2e6f40";
                }}
                onClick={() => {
                  sendMessage();
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getVividColorFromName(name) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate vibrant RGB values
  const r = (hash >> 0) & 0xff;
  const g = (hash >> 8) & 0xff;
  const b = (hash >> 16) & 0xff;

  // Boost vibrancy by converting to HSL and tweaking saturation/lightness
  const [h, s, l] = rgbToHsl(r, g, b);
  const [vr, vg, vb] = hslToRgb(h, 0.9, 0.6); // High saturation, medium lightness

  return rgbToHex(vr, vg, vb);
}

// Helper: Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

// Helper: Convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Helper: Convert RGB to hex
function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export default App;
