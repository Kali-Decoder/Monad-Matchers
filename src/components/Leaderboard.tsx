import React from "react";
import numeral from "numeral";
import { useDataContext } from "@/context/DataContext";
import { useAccount } from "wagmi";

const Leaderboard = () => {
  const { leaderBoardData } = useDataContext();
  const { address } = useAccount();
  return (
    <div className="mx-auto w-full p-6 h-[100vh]  overflow-scroll ">
      <h2 className="text-2xl font-bold text-center mb-4">🏆 Leaderboard</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-gray-700 uppercase text-sm">
            <th className="py-2 px-4 text-left">Rank</th>
            <th className="py-2 px-4 text-center">Player</th>
            <th className="py-2 px-4 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderBoardData &&
            leaderBoardData.map((player, index) => (
              <tr
                key={index}
                className={`border-b ${
                  index === 0 ? "bg-yellow-100" : "bg-white"
                } ${address == player?.user ? "bg-blue-400" : "bg-white"}`}
              >
                <td className="py-2 px-4">
                  {index + 1}{" "}
                  {index + 1 == 1 ? (
                    <span className="text-xl">🏆</span>
                  ) : index + 1 == 2 ? (
                    <span className="text-2xl">🥈</span>
                  ) : index + 1 == 3 ? (
                    <span className="text-2xl">🥉</span>
                  ) : null}{" "}
                </td>
                <td className="py-2 px-4 font-medium">
                  {player?.user.slice(0, 5) + "..." + player?.user.slice(-5)}
                </td>
                <td className="py-2 px-4 text-right font-semibold">
                  {numeral(player.totalPoints).format("0.0a")} XP
                </td>
              </tr>
            ))}

          {!leaderBoardData?.length && (
            <tr>
              <td
                colSpan={3}
                className="text-center text-red-500 uppercase font-semibold py-4"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
