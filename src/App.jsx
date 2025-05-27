import { useCallback, useEffect, useRef, useState } from "react";
import { useAssetStore } from "./stores/AssetStore";
import Graphic from "./components/Graphic/Graphic";
import graphicManager from "./components/Graphic/GraphicManager";

const MAX_BOTS = 15;

function App() {
  const marketDataConnection = useRef(null);
  const chatConnection = useRef(null);

  const { assets, setAsset } = useAssetStore();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("Denis Azevedo");
  const [roomData, setRoomData] = useState({
    bots: [],
  });

  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);
  const [isLockedScroll, setIsLockedScroll] = useState(true);

  useEffect(() => {
    if (messagesRef.current && isLockedScroll) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.addEventListener("scroll", () => {
        setIsLockedScroll(
          messagesRef.current.scrollTop ===
            messagesRef.current.scrollHeight - messagesRef.current.clientHeight
        );
      });
    }
  }, []);

  useEffect(() => {
    const baseUrl = window.location.hostname;
    marketDataConnection.current = new WebSocket(
      `ws://${baseUrl}/market-data/`
    );
    chatConnection.current = new WebSocket(`ws://${baseUrl}/chat/`);

    marketDataConnection.current.onmessage = (event) => {
      const { name: asset, price } = JSON.parse(event.data).data;
      setAsset(asset, price);
      graphicManager.saveHistory(asset, price);
    };

    chatConnection.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "message") {
        setMessages((prevMessages) =>
          [...prevMessages, message.data].slice(-150).filter(Boolean)
        );
      } else {
        switch (message.type) {
          case "listRoom":
            setRoomData({ bots: message.data });
            break;
          case "enterRoom":
            setRoomData((prevRoomData) => ({
              ...prevRoomData,
              bots: [...prevRoomData.bots, message.data.bot],
            }));
            break;
          case "leaveRoom":
            setRoomData((prevRoomData) => ({
              ...prevRoomData,
              bots: prevRoomData.bots.filter(
                (bot) => bot.name !== message.data.bot.name
              ),
            }));
            break;
        }
      }
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
          style={{
            background: "#222",
            flex: 1,
            padding: 20,
            color: "#FFF",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              justifyContent: "space-between",
              lineHeight: 1,
            }}
          >
            Chat{" "}
            <span style={{ fontWeight: "normal", fontSize: 12 }}>
              {roomData.bots?.length} online
            </span>
          </div>

          <div
            style={{
              paddingTop: 10,
              display: "grid",
              gridTemplateRows: "auto 1fr auto auto",
              gap: 5,
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 0,
                marginBottom: 10,
              }}
            >
              {roomData.bots.slice(0, MAX_BOTS).map((bot, index) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: "bold",
                    width: 26,
                    marginRight: -8,
                    cursor: "pointer",
                    userSelect: "none",
                    height: 26,
                    borderRadius: "50%",
                    background: getVividColorFromName(bot.name),
                  }}
                  key={index}
                >
                  {getInitials(bot.name)}
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: "bold",
                  width: 26,
                  marginRight: -5,
                  cursor: "pointer",
                  userSelect: "none",
                  height: 26,
                  borderRadius: "50%",
                  background: "#222",
                }}
              >
                +{roomData.bots.length - MAX_BOTS}
              </div>
            </div>

            <div ref={messagesRef} style={{ overflowY: "auto" }}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    color: message.type === "system" ? "gray" : "unset",
                    padding: 5,
                    borderRadius: 5,
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
                fontSize: 10,
                color: "gray",
                cursor: "pointer",
                display: "flex",
                justifyContent: "end",
                height: 20,
                marginTop: -20,
                marginRight: 20,
                gap: 2,
              }}
              onClick={() => {
                setIsLockedScroll(!isLockedScroll);
              }}
            >
              <span style={{ fontWeight: "bold" }}>Scroll:</span>
              <span
                style={{
                  fontWeight: "normal",
                  color: isLockedScroll ? "#00FF00" : "tomato",
                }}
              >
                {isLockedScroll ? "Locked" : "Unlocked"}
              </span>
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

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

// Helper: Convert RGB to hex
function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export default App;
