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
