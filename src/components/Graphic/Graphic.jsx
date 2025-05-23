import { useEffect, useRef } from "react";
import { useAssetStore } from "../../stores/AssetStore";
import graphicManager from "./GraphicManager";

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function getCandleData(candle) {
  return {
    open: candle[0],
    high: Math.max(...candle),
    low: Math.min(...candle),
    close: candle.at(-1),
  };
}

export default function Graphic() {
  const canvasRef = useRef(null);
  const assetStore = useAssetStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const animate = () => {
      const CURRENT_ASSET = assetStore.currentAsset;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const asset = assetStore.assets[CURRENT_ASSET];

      console.log(asset);

      if (!asset) return;

      const dataSerie = graphicManager.getHistory(CURRENT_ASSET);
      const candles = chunkArray(dataSerie, 10);

      let candleIndex = 0;
      for (const candle of candles) {
        const { open, high, low, close } = getCandleData(candle);

        const CANDLE_WIDTH = 10;
        const CANDLE_HEIGHT = 50;

        const priceToPixel = (price) => {
          return canvas.height - (price / 1000) * CANDLE_HEIGHT;
        };

        const x = 10 + 10 * candleIndex;
        const y = priceToPixel((open + close) / 2);

        ctx.fillStyle = "white";
        ctx.fillRect(x, y, CANDLE_WIDTH, CANDLE_HEIGHT);

        candleIndex++;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [assetStore.currentAsset, assetStore.assets]);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
