import { useEffect, useState } from "react";
import { useAssetStore } from "../../stores/AssetStore";

export default function AssetSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentAsset, setCurrentAsset, assets } = useAssetStore();

  useEffect(() => {
    console.log(assets);
  }, [assets]);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: "#222",
          border: "none",
          cursor: "pointer",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
      >
        <div>{currentAsset}</div>
      </button>
      <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {Object.keys(assets).map((asset) => (
            <div
              key={asset}
              onClick={() => {
                setCurrentAsset(asset);
                setIsOpen(false);
              }}
              style={{
                backgroundColor: "#222",
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "10px",
                display: "block",
              }}
            >
              {asset}
            </div>
          ))}
        </div>
      </Dropdown>
    </div>
  );
}

function Dropdown({ isOpen, children }) {
  return (
    <div style={{ position: "absolute", top: 30, left: 0 }}>
      {isOpen && children}
    </div>
  );
}
