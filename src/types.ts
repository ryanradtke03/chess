import { Board } from "./engine/board";

export type PieceColor = "w" | "b";
export type PieceRole = "K" | "Q" | "R" | "B" | "N" | "P";
export type PieceSet = "alpha" | "cburnett" | "merdia";

export interface PieceProps {
  color: PieceColor;
  role: PieceRole;
}

// Board
export interface BoardProps {
  lightColor?: string;
  darkColor?: string;
  size?: number;
  squares: (PieceProps | null)[];
  onSquareClick: (index: number) => void;
  selected?: number | null;
}

export type U64 = bigint;
export type BBKey =
  | "WP"
  | "WN"
  | "WB"
  | "WR"
  | "WQ"
  | "WK"
  | "BP"
  | "BN"
  | "BB"
  | "BR"
  | "BQ"
  | "BK";

export interface MoveContext {
  board: Board;
  square: number;
  color: PieceColor;
}

export type Delta = [number, number]; // [fileDelta, rankDelta]

export interface MoveFinderContext extends MoveContext {
  delta: Delta;
}
