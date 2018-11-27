export const MONGO_URL = 'mongodb://localhost:27017/lexxx';
export const bases = ['bitcoin', 'ethereum', 'tether'];
export const products = [
  'bitcoin', 'ethereum', 'litecoin', 'eos', 'stellar', 'cardano',
  'monero', 'dash', 'iota', 'ripple', 'neo', 'zcash', 'waves',
];
export const exchangesSettings = {
  binance: {
    socket: { url: 'wss://stream.binance.com:9443/stream' },
  },
};
export const exchangesCoinsTickers = {
  global: {
    bitcoin: 'btc',
    ethereum: 'eth',
    tether: 'usdt',
    litecoin: 'ltc',
    eos: 'eos',
    stellar: 'xlm',
    cardano: 'ada',
    monero: 'xmr',
    dash: 'dash',
    iota: 'iota',
    ripple: 'xrp',
    neo: 'neo',
    zcash: 'zec',
    waves: 'waves',
  },
  binance: {
    tether: 'usdt',
  },
  hitbtc: {
    tether: 'usd',
  },
};
