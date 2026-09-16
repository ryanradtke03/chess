import type { MoveContext } from "../types";
import { fileOf, rankOf, squareOf } from "../utils";

export function getLegalMoves({ board, square, color }: MoveContext): number[] {
  const piece = board.pieceAt(square);

  console.log(`Piece: ${piece?.role} at ${square}`);

  if (!piece) return [];
  if (piece.color !== color) return [];

  switch (piece.role) {
    case "P":
      return pawnMoves({ board, square, color });
    case "K":
      return kingMoves({ board, square, color });
    case "Q":
      return queenMoves({ board, square, color });
    case "B":
      return bishopMoves({ board, square, color });
    case "N":
      return knightMoves({ board, square, color });
    case "R":
      return rookMoves({ board, square, color });
    default:
      console.error("Invalid pience to move");
      return [];
  }
}

function pawnMoves({ board, square, color }: MoveContext): number[] {
  let moves: number[] = [];
  const multplier = color === "w" ? 1 : -1;
  const startRank = color === "w" ? 1 : 6;

  const r = rankOf(square);
  const f = fileOf(square);

  const target = squareOf(r + multplier, f);
  const occupant = board.pieceAt(target);

  // Starting??
  if (r === startRank) {
    // Are both squares empty in front?
    const secondTarget = squareOf(r + 2 * multplier, f);
    const secondOccupant = board.pieceAt(target);
    if (!occupant && !secondOccupant) {
      // Add 2 up as a valid move
      moves.push(secondTarget);
    }
  }

  // Check if we can move one up
  if (!occupant) moves.push(target);

  // Can capture anything?
  for (const df of [-1, 1]) {
    const cf = f + df;

    if (cf < 0 || cf > 7) continue;

    const captureTarget = squareOf(r + multplier, cf);
    console.log(`Look at target: (${captureTarget})`);
    let occupied = board.pieceAt(captureTarget);
    console.log(`Is occupied? ${occupied}`);
    console.log(
      `CaptureTarger: (${captureTarget})    Board.enPassant: (${board.enPassantTarget})`,
    );
    if (
      captureTarget === board.enPassantTarget ||
      (occupied && occupied.color !== color)
    ) {
      moves.push(captureTarget);
    }
  }

  // Can en pessant?

  // Promotion?

  return moves;
}

function kingMoves({ board, square, color }: MoveContext): number[] {
  return [];
}

function queenMoves({ board, square, color }: MoveContext): number[] {
  return [];
}

function bishopMoves({ board, square, color }: MoveContext): number[] {
  return [];
}

function knightMoves({ board, square, color }: MoveContext): number[] {
  console.log("Chekcing knight moves");
  const KNIGHT_DELTAS = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ];

  const r = rankOf(square);
  const f = fileOf(square);

  let moves: number[] = [];

  for (const [df, dr] of KNIGHT_DELTAS) {
    const nf = f + df;
    const nr = r + dr;

    if (nf < 0 || nf > 7 || nr < 0 || nr > 7) continue;

    const target = squareOf(nr, nf);
    const occupant = board.pieceAt(target);

    if (occupant && occupant.color === color) continue; // cant move onto friendly pience

    moves.push(target);
  }

  return moves;
}

function rookMoves({ board, square, color }: MoveContext): number[] {
  return [];
}
