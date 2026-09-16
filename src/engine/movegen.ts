import type {
  Delta,
  MoveContext,
  MoveFinderContext,
  PieceColor,
} from "../types";
import { fileOf, rankOf, squareOf } from "../utils";
import type { Board } from "./board";

export function legalMovesFrom({
  board,
  square,
  color,
}: MoveContext): number[] {
  const piece = board.pieceAt(square);
  const moves = movesFrom({ board, square, color });

  // Return moves that dont leave king in check
  let legal: number[] = moves.filter((to) => {
    const test = board.clone();
    test.makeMove(square, to);
    return !isKingInCheck(test, color);
  });

  // Check for castle
  if (piece?.role === "K") {
    legal.push(...castlingMoves(board, color));
  }

  return legal;
}

function isKingInCheck(board: Board, color: PieceColor): boolean {
  const kingSquare = board.kingAt(color);

  const enemy: PieceColor = enemyOf(color);
  return isSquareAttacked(board, kingSquare, enemy);
}

function enemyOf(color: PieceColor): PieceColor {
  return color === "w" ? "b" : "w";
}

// Room for optimization here later
function isSquareAttacked(
  board: Board,
  targetSquare: number,
  enemy: PieceColor,
): boolean {
  for (let sq = 0; sq <= 63; sq++) {
    let piece = board.pieceAt(sq);

    if (!piece) continue;
    if (piece.color !== enemy) continue;

    const moves: number[] = movesFrom({ board, square: sq, color: enemy });

    if (moves.includes(targetSquare)) return true;
  }

  return false;
}

function movesFrom({ board, square, color }: MoveContext): number[] {
  const piece = board.pieceAt(square);
  let moves: number[] = [];

  console.log(`Piece: ${piece?.role} at ${square}`);

  if (!piece) return moves;
  if (piece.color !== color) return moves;

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

const DIAGONAL_DELTAS: Delta[] = [
  [-1, -1],
  [-1, 1],
  [1, 1],
  [1, -1],
];
const VERTICAL_DELTAS: Delta[] = [
  [0, 1],
  [0, -1],
];
const HORIZONTAL_DELTAS: Delta[] = [
  [1, 0],
  [-1, 0],
];

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

  // Promotion?

  return moves;
}

function kingMoves({ board, square, color }: MoveContext): number[] {
  const KING_DELTAS: Delta[] = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  let moves: number[] = [];

  const r = rankOf(square);
  const f = fileOf(square);

  for (const [df, dr] of KING_DELTAS) {
    const nf = f + df;
    const nr = r + dr;

    if (nf < 0 || nf > 7 || nr < 0 || nr > 7) continue;

    const target = squareOf(nr, nf);
    const occupant = board.pieceAt(target);

    if (occupant && occupant.color === color) continue; // cant move onto friendly piece

    moves.push(target);
  }

  return moves;
}

function castlingMoves(board: Board, color: PieceColor): number[] {
  let moves: number[] = [];
  let enemy: PieceColor = enemyOf(color);

  // Cant castle out of check
  if (isKingInCheck(board, color)) return [];

  let searchSpace: number[] = [];
  if (color === "w") {
    searchSpace = [5, 6];
    if (
      board.whiteKingSide &&
      empty(board, searchSpace) &&
      notAttacked(board, searchSpace, enemy)
    ) {
      moves.push(6);
    }

    searchSpace = [1, 2, 3];
    if (
      board.whiteQueenSide &&
      empty(board, searchSpace) &&
      notAttacked(board, [2, 3], enemy)
    ) {
      moves.push(2);
    }
  } else {
    searchSpace = [61, 62];
    if (
      board.blackKingSide &&
      empty(board, searchSpace) &&
      notAttacked(board, searchSpace, enemy)
    ) {
      moves.push(62);
    }

    searchSpace = [58, 59];
    if (
      board.blackQueenSide &&
      empty(board, searchSpace) &&
      notAttacked(board, searchSpace, enemy)
    ) {
      moves.push(58);
    }
  }

  return moves;
}

function empty(board: Board, targets: number[]): boolean {
  // For each target, if there is a piece then its not empty
  for (const target of targets) {
    if (board.pieceAt(target)) return false;
  }

  return true;
}

function notAttacked(
  board: Board,
  targets: number[],
  enemy: PieceColor,
): boolean {
  for (const target of targets) {
    if (isSquareAttacked(board, target, enemy)) return false;
  }

  return true;
}

function knightMoves({ board, square, color }: MoveContext): number[] {
  console.log("Chekcing knight moves");
  const KNIGHT_DELTAS: Delta[] = [
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

    if (occupant && occupant.color === color) continue; // cant move onto friendly piece

    moves.push(target);
  }

  return moves;
}

function queenMoves({ board, square, color }: MoveContext): number[] {
  let moves: number[] = [];
  for (const delta of DIAGONAL_DELTAS) {
    let found = findMovesOnDelta({ board, square, color, delta });
    moves.push(...found);
  }
  for (const delta of HORIZONTAL_DELTAS) {
    let found = findMovesOnDelta({ board, square, color, delta });
    moves.push(...found);
  }
  for (const delta of VERTICAL_DELTAS) {
    let found = findMovesOnDelta({ board, square, color, delta });
    moves.push(...found);
  }
  return moves;
}

function bishopMoves({ board, square, color }: MoveContext): number[] {
  let moves: number[] = [];
  for (const delta of DIAGONAL_DELTAS) {
    let found = findMovesOnDelta({ board, square, color, delta });
    moves.push(...found);
  }
  return moves;
}

function rookMoves({ board, square, color }: MoveContext): number[] {
  let moves: number[] = [];
  for (const delta of HORIZONTAL_DELTAS) {
    let found = findMovesOnDelta({ board, square, color, delta });
    moves.push(...found);
  }
  for (const delta of VERTICAL_DELTAS) {
    let found = findMovesOnDelta({ board, square, color, delta });
    moves.push(...found);
  }
  return moves;
}

function findMovesOnDelta({
  board,
  square,
  color,
  delta,
}: MoveFinderContext): number[] {
  let moves: number[] = [];
  const f = fileOf(square);
  const r = rankOf(square);

  let nf = f + 1 * delta[0];
  let nr = r + 1 * delta[1];

  console.log(`findMoves start: square=${square} delta=[${delta}]`);

  while (nf >= 0 && nf <= 7 && nr >= 0 && nr <= 7) {
    const target = squareOf(nr, nf);
    const occupant = board.pieceAt(target);
    console.log(
      `  checking target=${target} (f=${nf},r=${nr}) occupant=`,
      occupant,
    );

    if (occupant && occupant.color === color) {
      console.log(`  friendly at ${target} → stop`);
      break;
    }

    moves.push(target);
    console.log(`  pushed ${target}`);

    if (occupant && occupant.color !== color) {
      console.log(`  captured enemy at ${target} → stop`);
      break;
    }

    nf += delta[0];
    nr += delta[1];
  }

  console.log(`findMoves done: [${moves}]`);

  return moves;
}
