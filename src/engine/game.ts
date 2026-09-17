import { log } from "../log";
import type { GameStatus, Move, PieceColor } from "../types";
import { Board } from "./board";
import { allLegalMoves, isKingInCheck, legalMovesFrom } from "./movegen";

export class Game {
  board: Board;
  toMove: PieceColor = "w";
  status: GameStatus = "ongoing";

  constructor(fen?: string) {
    this.board = new Board(fen);
  }

  move({ from, to, promotion }: Move): void {
    // Find legal moves and see if to is included
    log.debug("Game.move from/to:", from, to);
    let moves = legalMovesFrom({
      board: this.board,
      square: from,
      color: this.toMove,
    });
    log.debug("MOVE attempt:", { from, to, promotion, toMove: this.toMove });

    log.debug("  legal:", moves);

    const match = moves.some(
      (m) => m.from === from && m.to === to && m.promotion === promotion,
    );
    log.debug("  matched?", match);
    if (!match) return;

    // Make and update turn
    this.board.makeMove({ from, to, promotion });
    this.toMove = this.toMove === "w" ? "b" : "w";

    // Check for game stauts
    moves = allLegalMoves(this.board, this.toMove);
    if (moves.length === 0) {
      this.status = isKingInCheck(this.board, this.toMove)
        ? "checkmate"
        : "stalemate";
    } else {
      this.status = "ongoing";
    }
  }

  clone(): Game {
    const g = new Game();
    g.board = this.board.clone();
    g.toMove = this.toMove;
    g.status = this.status;
    return g;
  }
}
