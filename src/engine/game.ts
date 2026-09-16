import type { PieceColor } from "../types";
import { Board } from "./board";

export class Game {
  board: Board;
  toMove: PieceColor = "w";

  constructor(fen?: string) {
    this.board = new Board(fen);
  }

  clone(): Game {
    const g = new Game();
    g.board = this.board.clone();
    g.toMove = this.toMove;
    return g;
  }
}

const trialFens: string[] = [
  "Q7/8/8/8/8/8/8/8", // 0: white queen top-left (a8) — orientation check
  "8/8/8/8/8/8/8/7Q", // 1: white queen bottom-right (h1) — orientation check
  "8/8/8/8/8/8/8/8", // 2: empty board
  "r6r/8/8/8/8/8/8/R6R", // 3: rooks in all 4 corners
  "4k3/8/8/8/8/8/8/4K3", // 4: black king e8, white king e1
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", // 5: standard start position
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR", // 6: after 1.e4 e5
  "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R", // 7: Ruy Lopez
];
