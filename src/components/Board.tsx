import type { BoardProps } from "../types";
import Piece from "./Piece";

function Board({
  squares,
  onSquareClick,
  selected,
  lightColor = "#f0d9b5",
  darkColor = "#b58863",
  size = 512,
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
        const isLight = (Math.floor(i / 8) + (i % 8)) % 2 === 0;
        return (
          <div
            key={i}
            onClick={() => onSquareClick(i)}
            className={`aspect-square ${isLight ? "bg-[var(--light-sq)]" : "bg-[var(--dark-sq)]"} ${i === selected ? "ring-4 ring-yellow-400 ring-inset" : ""}`}
          >
            {piece && <Piece color={piece.color} role={piece.role} />}
          </div>
        );
      })}
    </div>
  );
}

export default Board;
