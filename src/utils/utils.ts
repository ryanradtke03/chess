import type { PieceColor } from "../types";
// square utils — bit index 0 = a1, rank 0 = rank 1, file 0 = a-file
export const rankOf = (sq: number): number => sq >> 3; // which row (0–7)
export const fileOf = (sq: number): number => sq & 7; // which column (0–7)
export const squareOf = (rank: number, file: number): number => rank * 8 + file;
export function squareToBit(i: number): number {
  return (7 - Math.floor(i / 8)) * 8 + (i % 8);
}

export function enemyOf(color: PieceColor): PieceColor {
  return color === "w" ? "b" : "w";
}
