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
  leaderBoardData: any[];
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
  const [leaderBoardData, setLeaderBoardData] = useState<any[]>([]);
  const [personalStats, setPersonalStats] = useState<any>({
    totalWins: 0,
    totalLosses: 0,
    totalPoints: 0,
  });
  const [isPlayEnable, setPlayEnable] = useState(false);
  const [moves, setMoves] = useState(0);
  useEffect(() => {
    setActiveChainId(chain);
  }, [chain]);
  const signer = useEthersSigner({ chainId: chain });
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
          value: ethers.utils.parseEther("0.0005"),
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
        Addresses[activeChain].mainContractAddress,
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
        await getMonadStatsClub();
        toast.success("Game ended successfully", { id });
      }
    } catch (error) {
      console.log("Error", error);
      toast.error("Error in ending game", { id });
    }
  };
  const getMonadStatsClub = async () => {
    if (!activeChain) {
      console.log("Chain not found");
      return;
    }
    try {
      const contract = await getContractInstance(
        Addresses[activeChain].mainContractAddress,
        MainContractABI
      );
      if (contract) {
        console.log("Calling array");
        const stats = await contract.getMonadStatsClub();
        const length = stats.length;
        let leaderBoard = [
          { user: "0xA1B2C3D4E5", totalPoints: 980 },
          { user: "0xF6G7H8I9J0", totalPoints: 750 },
          { user: "0xK1L2M3N4O5", totalPoints: 910 },
          { user: "0xP6Q7R8S9T0", totalPoints: 650 },
          { user: "0xU1V2W3X4Y5", totalPoints: 870 },
          { user: "0xZ6A7B8C9D0", totalPoints: 400 },
          { user: "0xE1F2G3H4I5", totalPoints: 680 },
          { user: "0xJ3K4L5M6N7", totalPoints: 920 },
          { user: "0xO8P9Q0R1S2", totalPoints: 540 },
          { user: "0xT3U4V5W6X7", totalPoints: 720 },
          { user: "0xY8Z9A0B1C2", totalPoints: 990 },
          { user: "0xD3E4F5G6H7", totalPoints: 460 },
          { user: "0xI8J9K0L1M2", totalPoints: 810 },
          { user: "0xN3O4P5Q6R7", totalPoints: 320 },
          { user: "0xS8T9U0V1W2", totalPoints: 860 },
        ];
        // we have to arrange in ascending order with totalPoints
        for (let i = 0; i < length; i++) {
          leaderBoard.push({
            totalPoints: +stats[i].points.toString(),
            totalWins: +stats[i].winnings.toString(),
            totalLosses: +stats[i].losses.toString(),
            user: stats[i].user,
          });
        }
        leaderBoard.sort((a, b) => b.totalPoints - a.totalPoints);
        setLeaderBoardData(leaderBoard);
        console.log("LeaderBoard", leaderBoard);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };
  const getStats = async () => {
    try {
      const contract = await getContractInstance(
        Addresses[chain].mainContractAddress,
        MainContractABI
      );
      let obj = {
        totalWins: 0,
        totalLosses: 0,
        totalPoints: 0,
      };
      if (contract) {
        const stats = await contract.getStats();
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
    getMonadStatsClub();
  }, [signer, address, chain]);

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
        leaderBoardData,
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
