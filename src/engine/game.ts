import type { GameStatus, Move, PieceColor } from "../types";
import { log } from "../utils/log";
import { Board } from "./board";
import * as movegen from "./movegen";

export class Game {
  board: Board;
  toMove: PieceColor = "w";
  status: GameStatus = "ongoing";

  // core game logic ------------
  move({ from, to, promotion }: Move): void {
    log.debug("Game.move from/to:", from, to);

    // only move is game is on going
    if (this.status !== "ongoing") return;

    // find legal moves
    let moves = movegen.legalMovesFrom({
      board: this.board,
      square: from,
      color: this.toMove,
    });

    log.debug("MOVE attempt:", { from, to, promotion, toMove: this.toMove });
    log.debug("  legal:", moves);

    // find if our targeted move is a legal move
    const match = moves.some(
      (m) => m.from === from && m.to === to && m.promotion === promotion,
    );

    log.debug("  matched?", match);

    // return if move is not legal
    if (!match) return;

    // make the move
    this.board.makeMove({ from, to, promotion });

    // change turns
    this.toMove = this.toMove === "w" ? "b" : "w";

    // check / update game status
    // find ALL legal moves
    moves = movegen.allLegalMoves(this.board, this.toMove);

    // if none left
    if (moves.length === 0) {
      // determine if game ended in checkmate or stalemate
      this.status = movegen.isKingInCheck(this.board, this.toMove)
        ? "checkmate"
        : "stalemate";
    } else {
      // else options to play; continue game
      this.status = "ongoing";
    }
  }

  constructor(fen?: string) {
    this.board = new Board(fen);
  }

  clone(): Game {
    const g = new Game();
    g.board = this.board.clone();
    g.toMove = this.toMove;
    g.status = this.status;
    return g;
  }
}
