const AssetHistoryDB = {};

const MAX_CANDLES = 35;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function createHistoryFromInitialPrice(price) {
  let history = [];
  let lastPrice = price;
  for (let i = 0; i < MAX_CANDLES * 10; i++) {
    const percent = randomBetween(-5, 5);
    const nextPrice = lastPrice * (1 + percent / 100);
    history.push(nextPrice);
    lastPrice = nextPrice;
  }
  history.reverse();
  return chunkArray(history, 10);
}

export function createGraphicManager() {
  function saveHistory(asset, price) {
    if (!AssetHistoryDB[asset]) {
      AssetHistoryDB[asset] = createHistoryFromInitialPrice(price); // Inicializa com um candle vazio
    }

    let lastCandle = AssetHistoryDB[asset].at(-1);

    if (lastCandle.length === 10) {
      // Criar novo candle e adicionar ao histórico
      const newCandle = [price];
      AssetHistoryDB[asset].push(newCandle);

      // Limita o histórico a 1000 candles
      if (AssetHistoryDB[asset].length > MAX_CANDLES) {
        AssetHistoryDB[asset].shift();
      }
    } else {
      lastCandle.push(price);
    }
  }

  function getHistory(asset) {
    return AssetHistoryDB[asset];
  }

  return { saveHistory, getHistory };
}

const graphicManager = createGraphicManager();

export default graphicManager;
