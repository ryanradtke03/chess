// engine/board.ts
import type { BBKey, PieceProps, U64 } from "../types";

export class Board {
  WP: U64 = 0n;
  WN: U64 = 0n;
  WB: U64 = 0n;
  WR: U64 = 0n;
  WQ: U64 = 0n;
  WK: U64 = 0n;
  BP: U64 = 0n;
  BN: U64 = 0n;
  BB: U64 = 0n;
  BR: U64 = 0n;
  BQ: U64 = 0n;
  BK: U64 = 0n;

  constructor(fen?: string) {
    this.setup(fen);
  }

  setup(fen?: string): void {
    if (fen) {
      this.loadFen(fen);
    } else {
      this.setStartingPosition();
    }
  }

  setStartingPosition(): void {
    this.WP = 0x000000000000ff00n;
    this.WN = 0x0000000000000042n;
    this.WB = 0x0000000000000024n;
    this.WR = 0x0000000000000081n;
    this.WQ = 0x0000000000000008n;
    this.WK = 0x0000000000000010n;
    this.BP = 0x00ff000000000000n;
    this.BN = 0x4200000000000000n;
    this.BB = 0x2400000000000000n;
    this.BR = 0x8100000000000000n;
    this.BQ = 0x0800000000000000n;
    this.BK = 0x1000000000000000n;
  }

  loadFen(fen: string): void {
    const FEN_TO_BB: Record<string, BBKey> = {
      P: "WP",
      N: "WN",
      B: "WB",
      R: "WR",
      Q: "WQ",
      K: "WK",
      p: "BP",
      n: "BN",
      b: "BB",
      r: "BR",
      q: "BQ",
      k: "BK",
    };

    // Fen validation here
    this.clearBoard();

    const placemanet = fen.split(" ")[0];
    let rank: number = 7;
    let file: number = 0;

    for (const c of placemanet) {
      if (c === "/") {
        // Next rank
        rank--;
        file = 0;
      } else if (c >= "1" && c <= "8") {
        // Move across
        file += Number(c);
      } else {
        // Place a piece
        const key = FEN_TO_BB[c];
        const square = rank * 8 + file;
        this[key] |= 1n << BigInt(square);
        file++;
      }
    }
  }

  clearBoard() {
    this.WP = this.WN = this.WB = this.WR = this.WQ = this.WK = 0n;
    this.BP = this.BN = this.BB = this.BR = this.BQ = this.BK = 0n;
  }

  // what piece (if any) is on square 0–63 (bit index, a1 = 0)
  pieceAt(sq: number): PieceProps | null {
    const mask = 1n << BigInt(sq);
    const table: [U64, PieceProps][] = [
      [this.WP, { color: "w", role: "P" }],
      [this.WN, { color: "w", role: "N" }],
      [this.WB, { color: "w", role: "B" }],
      [this.WR, { color: "w", role: "R" }],
      [this.WQ, { color: "w", role: "Q" }],
      [this.WK, { color: "w", role: "K" }],
      [this.BP, { color: "b", role: "P" }],
      [this.BN, { color: "b", role: "N" }],
      [this.BB, { color: "b", role: "B" }],
      [this.BR, { color: "b", role: "R" }],
      [this.BQ, { color: "b", role: "Q" }],
      [this.BK, { color: "b", role: "K" }],
    ];
    for (const [bb, piece] of table) {
      if (bb & mask) return piece;
    }
    return null;
  }

  // convert bitboards → 64-square array in RENDER order (index 0 = top-left = a8)
  toSquares(): (PieceProps | null)[] {
    const out: (PieceProps | null)[] = [];
    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) {
        out.push(this.pieceAt(rank * 8 + file));
      }
    }
    return out;
  }

  makeMove(from: number, to: number): void {
    const keys: BBKey[] = [
      "WP",
      "WN",
      "WB",
      "WR",
      "WQ",
      "WK",
      "BP",
      "BN",
      "BB",
      "BR",
      "BQ",
      "BK",
    ];

    const fromMask = 1n << BigInt(from);
    const toMask = 1n << BigInt(to);

    // Remove piece on to square
    for (const key of keys) {
      this[key] &= ~toMask;
    }

    // Remove pience from from square and add to to
    for (const key of keys) {
      if (this[key] & fromMask) {
        this[key] &= ~fromMask; // clear orgin
        this[key] |= toMask; // set destination bit
        break;
      }
    }
  }

  flipIndex(i: number): number {
    const rank = Math.floor(i / 8);
    const file = i % 8;
    return (7 - rank) * 8 + file;
  }

  clone(): Board {
    const b = new Board();
    b.WP = this.WP;
    b.WN = this.WN;
    b.WB = this.WB;
    b.WR = this.WR;
    b.WQ = this.WQ;
    b.WK = this.WK;
    b.BP = this.BP;
    b.BN = this.BN;
    b.BB = this.BB;
    b.BR = this.BR;
    b.BQ = this.BQ;
    b.BK = this.BK;
    return b;
  }
}
