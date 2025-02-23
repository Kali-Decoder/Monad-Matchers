"use client";
import React, { useState, useEffect } from "react";

const randomSort = () => Math.random() - 0.5;

const Card = ({ value, active, onClick }) => {
  return (
    <button
      className={`Card ${active ? "active overflow-hidden" : ""}`}
      onClick={onClick}
      disabled={active}
    >
      {active && (
        <img
          className=""
          src="https://img-cdn.magiceden.dev/autoquality:none/rs:fill:1600:0:0/plain/https%3A%2F%2Fbafybeibotdfgn6lfbtuefbi3nu7i67lqw3intugvs2g6aot25lckzolxnm.ipfs.w3s.link%2F0.png"
          width="100%"
          height="100%"
        />
      )}
    </button>
  );
};

const Board = () => {
  const initialValues = [
    "noto:bird",
    "noto:blossom",
    "noto:cactus",
    "noto:avocado",
    "noto:cookie",
    "noto:crystal-ball",
    "noto:peach",
    "noto:gorilla",
  ];

  const shuffledValues = [...initialValues, ...initialValues].sort(randomSort);

  const [cards, setCards] = useState(Array(16).fill(false));
  const [selected, setSelected] = useState([]);
  const [hits, setHits] = useState(0);

  const handleClick = (index) => {
    if (selected.length === 2) {
      return;
    }

    const newCards = [...cards];
    newCards[index] = true;
    const newSelected = [...selected, index];
    setCards(newCards);
    setSelected(newSelected);
  };

  useEffect(() => {
    if (selected.length === 2) {
      const [first, second] = selected;
      if (shuffledValues[first] !== shuffledValues[second]) {
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first] = false;
          newCards[second] = false;
          setCards(newCards);
        }, 1000);
      }
      setHits(hits + 1);
      setSelected([]);
    }
  }, [selected, shuffledValues, cards, hits]);

  return (
    <div className="orbitron-font mx-auto h-[100vh] flex">
      <div className="w-[25%]  border-4 m-4"></div>
      <div className="w-[50%] flex justify-center items-center flex-col space-y-8">
        <h1 className="font-bold text-pretty text-4xl">Monad Matching</h1>
        <div className="Board mt-8">
          {cards.map((active, index) => (
            <Card
              key={index}
              value={shuffledValues[index]}
              active={active}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
        <p className="text-4xl">Hits: {hits}</p>
      </div>
      <div className="w-[25%] border-4 m-4"></div>
    </div>
  );
};

export default Board;
