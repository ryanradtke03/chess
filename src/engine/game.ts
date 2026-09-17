import type { Move, PieceColor } from "../types";
import { Board } from "./board";
import { legalMovesFrom } from "./movegen";

export class Game {
  board: Board;
  toMove: PieceColor = "w";

  constructor(fen?: string) {
    this.board = new Board(fen);
  }

  move({ from, to, promotion }: Move): void {
    // Find legal moves and see if to is included
    console.log("Game.move from/to:", from, to);
    const moves = legalMovesFrom({
      board: this.board,
      square: from,
      color: this.toMove,
    });
    console.log("MOVE attempt:", { from, to, promotion, toMove: this.toMove });

    console.log("  legal:", moves);

    const match = moves.some(
      (m) => m.from === from && m.to === to && m.promotion === promotion,
    );
    console.log("  matched?", match);
    if (!match) return;

    // Make and update turn
    this.board.makeMove({ from, to, promotion });
    this.toMove = this.toMove === "w" ? "b" : "w";
  }

  clone(): Game {
    const g = new Game();
    g.board = this.board.clone();
    g.toMove = this.toMove;
    return g;
  }
}
