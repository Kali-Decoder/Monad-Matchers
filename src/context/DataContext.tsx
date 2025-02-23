"use client";
import React, { useState, useEffect, ReactNode } from "react";
import { useAccount, useChainId } from "wagmi";
import { useEthersSigner } from "@/utils/signer";
import { ethers, Contract } from "ethers";
import { toast } from "react-hot-toast";
import { Addresses, MainContractABI } from "@/constant";
// Context types
interface DataContextProps {
  formatTimestamp: (timestamp: number) => string;
  personalStats: {
    totalWins: number;
    totalLosses: number;
    totalPoints: number;
  };
  startGame: () => void;
  isPlayEnable: boolean;
  setPlayEnable: (val: boolean) => void;
  moves: number;
  setMoves: (val: number) => void;
  endGame: (isWin: boolean) => void;
}

interface DataContextProviderProps {
  children: ReactNode;
}

// Context initialization
const DataContext = React.createContext<DataContextProps | undefined>(
  undefined
);

const DataContextProvider: React.FC<DataContextProviderProps> = ({
  children,
}) => {
  const { address } = useAccount();
  const chain = useChainId();
  console.log("Chain", chain);
  const WIN_URI =
    "https://gateway.pinata.cloud/ipfs/bafkreiav7nrjmzaiywauf7vfjjormnl3hzi25qeljfehqgt2fqshftrl2i";
  const LOSS_URI =
    "https://gateway.pinata.cloud/ipfs/bafkreibfdgafgoyodb53xk6epovsv4244gnqjafxwtk3e2p6gzduvinci4";
  const [activeChain, setActiveChainId] = useState<number | undefined>(chain);
  const [personalStats, setPersonalStats] = useState<any>({
    totalWins: 0,
    totalLosses: 0,
    totalPoints: 0,
  });
  const [isPlayEnable, setPlayEnable] = useState(true);
  const [moves, setMoves] = useState(0);
  useEffect(() => {
    setActiveChainId(chain);
  }, [chain]);
  const signer = useEthersSigner({ chainId: activeChain });

  const getContractInstance = async (
    contractAddress: string,
    contractAbi: any
  ): Promise<Contract | undefined> => {
    try {
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      return contractInstance;
    } catch (error: any) {
      console.log("Error in deploying contract");
      return undefined;
    }
  };

  const startGame = async () => {
    const id = toast.loading("Starting game...");
    try {
      if (!activeChain) {
        console.log("Chain not found");
        return;
      }
      const contract = await getContractInstance(
        Addresses[activeChain].mainContractAddress,
        MainContractABI
      );
      if (contract) {
        const tx = await contract.playGame({
          from: address,
          value: ethers.utils.parseEther("0.000000000005"),
        });
        await tx.wait();
        setPlayEnable(true);
        setMoves(15);
        toast.success("Game started successfully", { id });
      }
    } catch (error) {
      console.log("Error", error);
      toast.error("Error in starting game", { id });
    }
  };

  const endGame = async (isWin: boolean) => {
    const id = toast.loading("Ending game...");
    try {
      if (!activeChain) {
        console.log("Chain not found");
        return;
      }
      const provider = new ethers.providers.JsonRpcProvider({
        url: process.env.NEXT_PUBLIC_RPC_URL,
        skipFetchSetup: true,
      });
      const wallet = new ethers.Wallet(
        process.env.NEXT_PUBLIC_PRIVATE_KEY!,
        provider
      );
      const signer = wallet.connect(provider);
      const contract = new ethers.Contract(
        "0x7AD1a4b60c8C265a951459B4888354D1339c3cDa",
        MainContractABI,
        signer
      );
      if (contract) {
        let tokenUri = isWin ? WIN_URI : LOSS_URI;
        const tx = await contract.endGame(isWin, tokenUri, address, {
          from: wallet.address,
        });
        await tx.wait();
        await getStats();
        toast.success("Game ended successfully", { id });
      }
    } catch (error) {
      console.log("Error", error);
      toast.error("Error in ending game", { id });
    }
  };
  const getStats = async () => {
    try {
      if (!activeChain) {
        console.log("Chain not found");
        return;
      }
      const contract = await getContractInstance(
        Addresses[activeChain].mainContractAddress,
        MainContractABI
      );
      let obj = {
        totalWins: 0,
        totalLosses: 0,
        totalPoints: 0,
      };
      if (contract) {
        const stats = await contract.getStats({ from: address });
        obj = {
          totalWins: +stats[2].toString(),
          totalLosses: +stats[1].toString(),
          totalPoints: +stats[0].toString(),
        };
        setPersonalStats({ ...obj });
        console.log("Stats", personalStats);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    if (!signer) return;
    getStats();
  }, [signer, address, activeChain]);

  function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  return (
    <DataContext.Provider
      value={{
        endGame,
        isPlayEnable,
        startGame,
        personalStats,
        formatTimestamp,
        setMoves,
        moves,
        setPlayEnable,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataContextProvider");
  }
  return context;
};

export default DataContextProvider;
