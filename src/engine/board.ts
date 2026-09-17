// engine/board.ts

import type { BBKey, Move, PieceColor, PieceProps, U64 } from "../types";
import { rankOf } from "../utils";

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
  enPassantTarget: number | null = null;
  whiteKingSide: boolean = true;
  whiteQueenSide: boolean = true;
  blackKingSide: boolean = true;
  blackQueenSide: boolean = true;

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

  kingAt(color: PieceColor): number {
    const bb = color === "w" ? this.WK : this.BK;

    let sq = 0;
    while ((bb & (1n << BigInt(sq))) === 0n) sq++; // move the mask
    return sq;
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

  private updateCastleRights(sq: number): void {
    switch (sq) {
      case 4:
        this.whiteKingSide = false;
        this.whiteQueenSide = false;
        console.log(
          "castle: white king moved → lost both white rights (K + Q)",
        );
        break; // e1 (king)
      case 0:
        this.whiteQueenSide = false;
        console.log("castle: a1 touched → lost white queenside (Q)");
        break; // a1 rook
      case 7:
        this.whiteKingSide = false;
        console.log("castle: h1 touched → lost white kingside (K)");
        break; // h1 rook
      case 60:
        this.blackKingSide = false;
        this.blackQueenSide = false;
        console.log(
          "castle: black king moved → lost both black rights (k + q)",
        );
        break; // e8 (king)
      case 56:
        this.blackQueenSide = false;
        console.log("castle: a8 touched → lost black queenside (q)");
        break; // a8 rook
      case 63:
        this.blackKingSide = false;
        console.log("castle: h8 touched → lost black kingside (k)");
        break; // h8 rook
    }
  }

  makeMove({ from, to }: Move): void {
    console.log(`Moving from: (${from}) to: (${to})`);

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

    const piece: PieceProps | null = this.pieceAt(from);
    const isPawn = piece?.role === "P";
    const isKing = piece?.role === "K";

    // en passant
    // executed en passant?
    if (isPawn && this.enPassantTarget === to) {
      // Did we take black or white?
      let r = rankOf(this.enPassantTarget);
      if (r === 2) {
        // Remove white
        let enPassantMask = 1n << BigInt(to + 8);
        this.WP &= ~enPassantMask;
      } else {
        // Remove black
        let enPassantMask = 1n << BigInt(to - 8);
        this.BP &= ~enPassantMask;
      }
    }

    // created en passant?
    if (isPawn && Math.abs(to - from) === 16) {
      this.enPassantTarget = (from + to) / 2; // mid point
      console.log(`Made en passant at: (${this.enPassantTarget})`);
    } else {
      this.enPassantTarget = null; //expires after one turn
    }

    // Check if move breaks castle
    console.log(`Updating Castle rights from: ${from} to: ${to}`);
    this.updateCastleRights(from);
    this.updateCastleRights(to);

    // Check if castle is being executed
    // Only need to move rook at king move will be executed in the 'normal' section
    if (isKing && Math.abs(to - from) === 2) {
      const CASTLE_ROOK: Record<number, [number, number]> = {
        2: [0, 3], // white queenside: a1 → d1
        6: [7, 5], // white kingside:  h1 → f1
        58: [56, 59], // black queenside: a8 → d8
        62: [63, 61], // black kingside:  h8 → f8
      };

      // king moved 2
      const [rookFrom, rookTo] = CASTLE_ROOK[to];
      const rookKey: BBKey = piece.color === "w" ? "WR" : "BR";
      this[rookKey] &= ~(1n << BigInt(rookFrom)); // lift rook
      this[rookKey] |= 1n << BigInt(rookTo); // drop rook
    }

    // rest of 'normal' behavior
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
    b.enPassantTarget = this.enPassantTarget;
    b.whiteKingSide = this.whiteKingSide;
    b.whiteQueenSide = this.whiteQueenSide;
    b.blackKingSide = this.blackKingSide;
    b.blackQueenSide = this.blackQueenSide;
    return b;
  }
}
