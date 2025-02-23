"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Leaderboard from "./Leaderboard";
import { useLogin, usePrivy, useLogout } from "@privy-io/react-auth";
import { useAccount, useBalance } from "wagmi";
import { useRouter } from "next/navigation";
import { useDataContext } from "@/context/DataContext";
import numeral from "numeral";
const randomSort = () => Math.random() - 0.5;

interface CardProps {
  value: string;
  url: string;
  active: boolean;
  onClick: () => void;
}

const Card = ({ value, url, active, onClick }: CardProps) => {
  return (
    <button
      className={`Card ${active ? "active overflow-hidden" : ""}`}
      onClick={onClick}
      disabled={active}
    >
      {active && (
        <Image
          src={url}
          width={100}
          height={100}
          className="w-full h-full"
          alt={value}
        />
      )}
    </button>
  );
};

const Board = () => {
  const { address } = useAccount();
  const {
    personalStats,
    startGame,
    isPlayEnable,
    setMoves,
    moves,
    setPlayEnable,
    endGame,
  } = useDataContext();
  const { ready, authenticated, user: privyUser } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => {
      router.push("/");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { logout } = useLogout({
    onSuccess: () => {
      router.push("/");
    },
  });
  const { data, isError, isLoading } = useBalance({
    address,
  });

  console.log(data);
  const initialValues = [
    {
      url: "https://pbs.twimg.com/media/GkKqj2CW4AA8xwF?format=jpg&name=large",
      value: "card1",
    },
    {
      url: "https://pbs.twimg.com/media/GkW0WHCXIAAhNXH?format=jpg&name=900x900",
      value: "card2",
    },
    {
      url: "https://pbs.twimg.com/media/Gj6X8ODW4AA9zJR?format=jpg&name=medium",
      value: "card3",
    },
    {
      url: "https://pbs.twimg.com/media/Gjn83UfWsAAFjsw?format=jpg&name=large",
      value: "card4",
    },
    {
      url: "https://pbs.twimg.com/media/GjmKKVYWEAAySYN?format=jpg&name=large",
      value: "card5",
    },
    {
      url: "https://pbs.twimg.com/media/Ge7gFEsXgAAu77_?format=jpg&name=900x900",
      value: "card6",
    },
    {
      url: "https://pbs.twimg.com/media/GetB4UiWYAAEP4_?format=jpg&name=900x900",
      value: "card7",
    },
    {
      url: "https://pbs.twimg.com/media/GkJ4sOpWMAAacmi?format=jpg&name=large",
      value: "card8",
    },
  ];

  // Ensure shuffledValues is computed only once on mount
  const shuffledValues = useMemo(
    () => [...initialValues, ...initialValues].sort(randomSort),
    []
  );

  const [cards, setCards] = useState<boolean[]>(Array(16).fill(false));
  const [selected, setSelected] = useState<number[]>([]);

  const handleClick = (index: number) => {
    if (!moves || selected.length === 2 || selected.includes(index)) return;
    const newCards = [...cards];
    newCards[index] = true;
    setCards(newCards);
    setSelected([...selected, index]);
  };

  useEffect(() => {
    if (selected.length === 2) {
      const [first, second] = selected;

      if (shuffledValues[first].value !== shuffledValues[second].value) {
        setTimeout(() => {
          setCards((prev) => {
            const newCards = [...prev];
            newCards[first] = false;
            newCards[second] = false;
            return newCards;
          });
        }, 1000);
      }
      setMoves((prev) => prev - 1);
      const checkGameState = async () => {
        console.log("Moves", moves, "inside checkGameState");

        // ✅ WIN CONDITION: All cards are flipped (i.e., no `false` remains)
        if (!cards.includes(false)) {
          console.log("🏆 Player Wins!");
          await endGame(true); // Pass `true` to indicate a win
          return;
        }
        // ❌ LOSS CONDITION: Moves reach 0 and the game isn't won
        if (moves === 1) {
          console.log("❌ Game Over: Player Loses");
          await endGame(false); // Pass `false` to indicate a loss
        }
      };
      checkGameState();
      setSelected([]);
    }
  }, [selected, shuffledValues]);

  const resetPlay = async () => {
    setCards(Array(16).fill(false));
    setSelected([]);
    await startGame();
  };

  return (
    <div className="orbitron-font mx-auto h-[100vh] flex">
      <div className="w-[20%] bg-[#fefae0] border-4 border-white rounded-md p-6 flex flex-col">
        <h1 className="font-bold text-pretty text-xl uppercase text-center">
          Monad Matchers
        </h1>
        <div className="flex flex-col p-2 mt-10">
          <h3 className="font-bold text-pretty text-xl uppercase">Stats</h3>
          <div className="flex justify-between mt-4 font-semibold">
            <p className="text-pretty text-md">Winnings</p>
            <p className="text-pretty text-md">
              {numeral(personalStats?.totalWins).format("0.0a")} 🟢
            </p>
          </div>
          <div className="flex justify-between mt-4 font-semibold">
            <p className="text-pretty text-md">Losses</p>
            <p className="text-pretty text-md">
              {numeral(personalStats?.totalLosses).format("0.0a")} 🔴
            </p>
          </div>
          <div className="flex justify-between mt-4 font-semibold">
            <p className="text-pretty text-md">Balance</p>
            <p className="text-pretty text-md">
              {numeral(data?.formatted).format("0.0a")} MON
            </p>
          </div>
          <div className="flex justify-between mt-4 font-semibold">
            <p className="text-pretty text-md">Points</p>
            <p className="text-pretty text-md">
              {numeral(personalStats?.totalPoints).format("0.0a")} XP
            </p>
          </div>
          <h3 className="font-bold text-pretty text-xl uppercase mt-8">
            Wallet-Stats
          </h3>
          <div className="flex justify-between mt-4 font-semibold">
            <p className="text-pretty text-xs">Address</p>
            <p className="text-pretty text-xs">
              {privyUser?.wallet
                ? privyUser?.wallet?.address.slice(0, 6) +
                  "..." +
                  privyUser?.wallet?.address.slice(-4)
                : "xxxx"}
            </p>
          </div>

          {disableLogin ? (
            <div className="flex flex-col justify-between mt-4 font-semibold">
              <button
                onClick={logout}
                className="bg-blue-500 cursor-pointer text-white px-2 py-1 rounded-md text-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-between mt-4 font-semibold">
              <button
                disabled={disableLogin}
                onClick={login}
                className="bg-blue-500 cursor-pointer text-white px-2 py-1 rounded-md text-xs"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="w-[40%] flex bg-[#fefae0] justify-center items-center flex-col space-y-8">
        {!isPlayEnable && (
          <>
            <h1 className="font-bold text-pretty text-2xl uppercase text-center">
              Monad Matchers
            </h1>
            <p className="text-pretty text-lg text-center uppercase">
              Click on the cards to <br /> find the matching pairs
            </p>
            <button
              onClick={async () => {
                await startGame();
              }}
              className="bg-blue-500 font-bold cursor-pointer text-white px-2 py-1 rounded-md text-xs"
            >
              Start Game
            </button>
          </>
        )}
        {isPlayEnable && (
          <div className="flex justify-between w-[100%] px-6">
            <p className="text-2xl font-bold mt-2 text-black block">
              Moves: {moves}
            </p>
            {moves === 0 && (
              <>
                <button
                  onClick={async () => {
                    await resetPlay();
                  }}
                  className="bg-blue-500 font-bold cursor-pointer text-white px-2 py-1 rounded-md text-xs"
                >
                  Restart
                </button>
              </>
            )}
          </div>
        )}
        {isPlayEnable && (
          <>
            <div className="Board mt-8">
              {cards.map((active, index) => (
                <Card
                  key={index}
                  value={shuffledValues[index].value}
                  url={shuffledValues[index].url}
                  active={active}
                  onClick={() => handleClick(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="w-[40%] rounded-md border-4 border-white bg-[#fefae0] flex flex-col text-center p-4 space-y-4">
        <Leaderboard />
      </div>
    </div>
  );
};

export default Board;
