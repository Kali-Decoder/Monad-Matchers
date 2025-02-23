import { http } from "viem";
// import {baseSepolia,celoAlfajores,mantleSepoliaTestnet,scrollSepolia,morphSepolia} from "wagmi/chains";
const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  iconUrl: "https://miro.medium.com/v2/resize:fit:400/0*aRHYdVg5kllfc7Gn.jpg",
  nativeCurrency: { name: "Monad Testnet", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz/"] },
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet",
      url: "https://monad-testnet.socialscan.io/",
    },
  },
};
const xoTestnet = {
  id: 123420001402,
  name: "xo-testnet",
  iconUrl: "",
  nativeCurrency: { name: "xo-testnet", symbol: "Test", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.xo-testnet.t.raas.gelato.cloud"] },
  },
  blockExplorers: {
    default: {
      name: "xo-testnet",
      url: "https://xo-testnet.cloud.blockscout.com",
    },
  },
};

export const chainArray = [monadTestnet,xoTestnet];
export const transportsObject = {
  [monadTestnet.id]: http(),
  [xoTestnet.id]: http(),
};
