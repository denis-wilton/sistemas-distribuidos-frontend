const AssetHistoryDB = {};

export function createGraphicManager() {
  function saveHistory(asset, price) {
    if (!AssetHistoryDB[asset]) {
      AssetHistoryDB[asset] = [];
    }
    AssetHistoryDB[asset].push(price);
    // limit to 1000
    if (AssetHistoryDB[asset].length > 1000) {
      AssetHistoryDB[asset].shift();
    }
  }

  function getHistory(asset) {
    return AssetHistoryDB[asset];
  }

  return { saveHistory, getHistory };
}

const graphicManager = createGraphicManager();

export default graphicManager;
