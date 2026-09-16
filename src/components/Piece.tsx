import type { PieceProps, PieceSet } from "../types";

function Piece({ color, role }: PieceProps) {
  const pieceSet: PieceSet = "alpha";
  const source: string = `/pieces/${pieceSet}`;
  return (
    <img src={`${source}/${color}${role}.svg`} className="w-full h-full" />
  );
}

export default Piece;
