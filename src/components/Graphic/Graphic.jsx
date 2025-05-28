import { useEffect, useRef } from "react";
import { useAssetStore } from "../../stores/AssetStore";
import graphicManager from "./GraphicManager";

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
  const animationRef = useRef(null);
  const assetStore = useAssetStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const width = parent.offsetWidth;
      const height = parent.offsetHeight;

      // Ajusta o tamanho físico do canvas
      canvas.width = width;
      canvas.height = height;

      draw(); // Redesenha ao redimensionar
    };

    const draw = async () => {
      const CURRENT_ASSET = assetStore.currentAsset ?? "PETR4";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // water mark with the current asset in the middle of the canvas
      ctx.fillStyle = "white";
      ctx.globalAlpha = 0.1;
      ctx.font = "88px Arial";
      const textWidth = ctx.measureText(CURRENT_ASSET).width;
      ctx.fillText(
        CURRENT_ASSET,
        canvas.width / 2 - textWidth / 2,
        canvas.height / 2
      );
      ctx.globalAlpha = 1;

      const candles = graphicManager.getHistory(CURRENT_ASSET);

      if (!candles) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const highestPrice = Math.max(...candles.flat());
      const lowestPrice = Math.min(...candles.flat());

      const priceToPixel = (price) => {
        return (
          canvas.height -
          ((price - lowestPrice) / (highestPrice - lowestPrice)) * canvas.height
        );
      };

      let candleIndex = 0;
      for (const candle of candles) {
        const { open, high, low, close } = getCandleData(candle);
        const x = 10 * candleIndex;

        // Sombra (linha vertical)
        ctx.fillStyle = "white";
        const highY = priceToPixel(high);
        const lowY = priceToPixel(low);
        ctx.fillRect(x + 4, highY, 1, lowY - highY);

        // Corpo da vela
        const openY = priceToPixel(open);
        const closeY = priceToPixel(close);
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY);

        ctx.fillStyle = open > close ? "#DC3545" : "#4BB543";
        ctx.fillRect(x + 1, bodyY, 8, bodyHeight);

        candleIndex++;
      }

      const currentPrice = candles.at(-1).at(-1);
      const currentPriceY = priceToPixel(currentPrice);
      ctx.fillStyle = "white";
      ctx.globalAlpha = 0.1;
      ctx.fillRect(0, currentPriceY, canvas.width, 1);

      ctx.globalAlpha = 1;
      ctx.font = "12px Arial";
      ctx.fillStyle = "white";

      const beforeCurrentPrice = candles.at(-1).at(0);
      const variation =
        ((currentPrice - beforeCurrentPrice) / beforeCurrentPrice) * 100;

      // measure current price width
      const currentPriceWidth = ctx.measureText(currentPrice.toFixed(2)).width;
      ctx.fillText(`${currentPrice.toFixed(2)}`, 10, currentPriceY - 10);
      ctx.fillStyle = variation > 0 ? "#4BB543" : "#DC3545";
      ctx.fillText(
        `(${variation.toFixed(2)}%)`,
        10 + 5 + currentPriceWidth,
        currentPriceY - 10
      );

      animationRef.current = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [assetStore.currentAsset]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
