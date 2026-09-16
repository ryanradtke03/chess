import type { PieceColor } from "../types";
import { Board } from "./board";

export class Game {
  board: Board;
  toMove: PieceColor = "w";

  constructor(fen?: string) {
    this.board = new Board(fen);
  }

  move(from: number, to: number): void {
    // Validation
    // is legal?

    // Make actual move
    this.board.makeMove(from, to);

    // Update turn
    this.toMove = this.toMove === "w" ? "b" : "w";
  }

  clone(): Game {
    const g = new Game();
    g.board = this.board.clone();
    g.toMove = this.toMove;
    return g;
  }
}
