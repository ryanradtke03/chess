import type { BBKey, Move, PieceColor, PieceRole } from "../types";
import { enemyOf } from "../utils/utils";
import type { Board } from "./board";
import * as movegen from "./movegen";

let nodes = 0;

// position value
// all written from white's view, top row = rank 8, bottom row = rank 1.
const PAWN_PST = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
  20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10,
  0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];

const KNIGHT_PST = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
  0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20,
  15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BISHOP_PST = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
  10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0,
  -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
  -10, -10, -10, -10, -10, -20,
];

const ROOK_PST = [
  0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0,
  -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0,
  -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
];

const QUEEN_PST = [
  -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
  5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5,
  5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
  -20,
];

// middlegame king — hide in the corner, stay off the center
const KING_PST = [
  -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
  -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40,
  -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20,
  -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
];

const PST: Record<PieceRole, number[]> = {
  P: PAWN_PST,
  N: KNIGHT_PST,
  B: BISHOP_PST,
  R: ROOK_PST,
  Q: QUEEN_PST,
  K: KING_PST,
};

const ROLES: PieceRole[] = ["P", "N", "B", "R", "Q", "K"];

// material values
const VALUE: Record<PieceRole, number> = {
  P: 100,
  N: 320,
  B: 330,
  R: 500,
  Q: 900,
  K: 0,
};

const mirror = (sq: number): number => sq ^ 56;

export function search(
  board: Board,
  color: PieceColor,
  depth: number,
): Move | null {
  const moves = movegen.allLegalMoves(board, color);
  if (moves.length === 0) return null;

  nodes = 0; // reset for this search
  const t0 = performance.now();

  // find best score
  let bestMove = moves[0];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of moves) {
    const next = board.clone();
    next.makeMove(move);

    // grab score
    // grab negative due to next turn being opponents (evaluate their score)
    const score = -negamax(next, enemyOf(color), depth - 1, -beta, -alpha);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
    alpha = Math.max(alpha, score);
  }
  const ms = performance.now() - t0;
  console.log(
    `depth ${depth}: ${nodes.toLocaleString()} nodes, ` +
      `${ms.toFixed(0)}ms, ${Math.round(nodes / (ms / 1000)).toLocaleString()} nps, ` +
      `best=${bestScore}`,
  );

  return bestMove;
}

// recursive core
function negamax(
  board: Board,
  color: PieceColor,
  depth: number,
  alpha: number,
  beta: number,
): number {
  nodes++;
  if (depth === 0) return evaluate(board, color);

  const moves = movegen.allLegalMoves(board, color);

  // no legal moves?
  // checkmate (bad) stalemate (draw)
  if (moves.length === 0) {
    return movegen.isKingInCheck(board, color) ? -Infinity : 0;
  }

  let best = -Infinity;
  for (const move of moves) {
    const next = board.clone();
    next.makeMove(move);
    // opponent moves next (negate score to get ours)
    const score = -negamax(next, enemyOf(color), depth - 1, -beta, -alpha);
    best = Math.max(best, score);
    alpha = Math.max(alpha, score); // raise our floor
    if (alpha >= beta) break; // CUTOFF — opponent won't allow this line
  }

  return best;
}

function evaluate(board: Board, color: PieceColor): number {
  let score = 0;

  for (const role of ROLES) {
    // white + black -
    // add up each white piece's material value plus positional value
    for (const sq of squares(board[`W${role}` as BBKey])) {
      score += VALUE[role] + PST[role][mirror(sq)];
    }
    for (const sq of squares(board[`B${role}` as BBKey])) {
      score -= VALUE[role] + PST[role][sq];
    }
  }

  return color === "w" ? score : -score;
}

function* squares(bb: bigint): Generator<number> {
  while (bb) {
    const sq = countTrailingZeros(bb); // where is lowest / first piece
    yield sq; // hand it count
    bb &= bb - 1n; // erase it, find next
  }
}

// walk bb till we find index of lowest set bit
function countTrailingZeros(bb: bigint): number {
  let n = 0;
  while (!(bb & 1n)) {
    bb >>= 1n;
    n++;
  }
  return n;
}
