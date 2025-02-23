import React from "react";
import numeral from "numeral";
const Leaderboard = () => {
  const players = [
    { rank: 1, name: "Neeraj Choubisa", score: 1500 },
    { rank: 2, name: "Alice Johnson", score: 1400 },
    { rank: 3, name: "Bob Smith", score: 1350 },
    { rank: 4, name: "Charlie Brown", score: 1280 },
    { rank: 5, name: "David Wilson", score: 1200 },
    { rank: 6, name: "Neeraj Choubisa", score: 1500 },
    { rank: 7, name: "Alice Johnson", score: 1400 },
    { rank: 8, name: "Bob Smith", score: 1350 },
    { rank: 9, name: "Charlie Brown", score: 1280 },
    { rank: 10, name: "David Wilson", score: 1200 },
  ];

  return (
    <div className="mx-auto w-full p-6">
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
          {players.map((player, index) => (
            <tr
              key={index}
              className={`border-b ${
                player.rank === 1 ? "bg-yellow-100" : "bg-white"
              }`}
            >
              <td className="py-2 px-4">{player.rank}</td>
              <td className="py-2 px-4 font-medium">{player.name}</td>
              <td className="py-2 px-4 text-right font-semibold">
                {numeral(player.score).format("0.0a")} XP
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
