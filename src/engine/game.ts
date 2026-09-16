import type { PieceColor } from "../types";
import { Board } from "./board";
import { legalMovesFrom } from "./movegen";

export class Game {
  board: Board;
  toMove: PieceColor = "w";

  constructor(fen?: string) {
    this.board = new Board(fen);
  }

  move(from: number, to: number): void {
    // Find legal moves and see if to is included
    const moves = legalMovesFrom({
      board: this.board,
      square: from,
      color: this.toMove,
    });
    console.log(`legal moves: ${moves}`);
    if (!moves.includes(to)) return;

    // Make and update turn
    this.board.makeMove(from, to);
    this.toMove = this.toMove === "w" ? "b" : "w";
  }

  clone(): Game {
    const g = new Game();
    g.board = this.board.clone();
    g.toMove = this.toMove;
    return g;
  }
}
