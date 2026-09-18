import type { BoardProps } from "../types";
import Piece from "./Piece";

function Board({
  squares,
  onSquareClick,
  selected,
  lightColor = "#f0d9b5",
  darkColor = "#b58863",
  size = 512,
  targets = [],
}: BoardProps) {
  return (
    <div
      className="grid grid-cols-8"
      style={
        {
          width: size,
          "--light-sq": lightColor,
          "--dark-sq": darkColor,
        } as React.CSSProperties
      }
    >
      {squares.map((piece, i) => {
        const file = i % 8;
        const rank = Math.floor(i / 8);

        const showFile = rank === 7; // bottom row gets a-h
        const showRank = file === 0; // left column gets 8-1

        const isLight = (rank + file) % 2 === 0;
        return (
          <div
            key={i}
            onClick={() => onSquareClick(i)}
            className={`relative aspect-square ${isLight ? "bg-[var(--light-sq)]" : "bg-[var(--dark-sq)]"} ${i === selected ? "ring-4 ring-yellow-400 ring-inset" : ""}`}
          >
            {piece && <Piece color={piece.color} role={piece.role} />}

            {targets.includes(i) && (
              <span className="pointer-events-none absolute inset-0 m-auto h-1/3 w-1/3 rounded-full bg-black/30" />
            )}

            {showRank && (
              <span
                className={`pointer-events-none absolute left-0.5 top-0.5 select-none text-[10px] font-semibold ${
                  isLight ? "text-[var(--dark-sq)]" : "text-[var(--light-sq)]"
                }`}
              >
                {8 - rank}
              </span>
            )}

            {showFile && (
              <span
                className={`pointer-events-none absolute bottom-0.5 right-0.5 select-none text-[10px] font-semibold ${
                  isLight ? "text-[var(--dark-sq)]" : "text-[var(--light-sq)]"
                }`}
              >
                {"abcdefgh"[file]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Board;
