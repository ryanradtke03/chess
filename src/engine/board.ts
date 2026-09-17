import type { BBKey, Move, PieceColor, PieceProps, U64 } from "../types";
import { rankOf } from "../utils/utils";

const KEYS: BBKey[] = [
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

const bit = (sq: number): U64 => 1n << BigInt(sq);

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

  // main function --------------------

  makeMove({ from, to, promotion }: Move): void {
    const piece: PieceProps | null = this.pieceAt(from);

    this.handelEnPassantCapture(piece, to);
    this.updateEnPassantTarget(piece, from, to);

    this.updateCastleRights(from);
    this.updateCastleRights(to);
    this.handleCastleRookMove(piece, from, to);

    this.movePiece(from, to);

    if (promotion) this.handlePromotion(piece, to, promotion);
  }

  private handelEnPassantCapture(piece: PieceProps | null, to: number): void {
    // must be a pawn moving to an en passant target
    if (piece?.role !== "P" && this.enPassantTarget !== to) return;

    // white or black being captured
    const captured = rankOf(to) === 2 ? to + 8 : to - 8;
    const key: BBKey = rankOf(to) === 2 ? "WP" : "BP";

    // remove it
    this[key] &= ~bit(captured);
  }

  private updateEnPassantTarget(
    piece: PieceProps | null,
    from: number,
    to: number,
  ): void {
    // set to square behind if double pushed
    const isDoublePush = piece?.role === "P" && Math.abs(to - from) === 16;
    this.enPassantTarget = isDoublePush ? (from + to) / 2 : null;
  }

  private handleCastleRookMove(
    piece: PieceProps | null,
    from: number,
    to: number,
  ): void {
    const CASTLE_ROOK: Record<number, [number, number]> = {
      2: [0, 3], // white queenside: a1 → d1
      6: [7, 5], // white kingside:  h1 → f1
      58: [56, 59], // black queenside: a8 → d8
      62: [63, 61], // black kingside:  h8 → f8
    };

    // return if not a king that moved by two
    if (piece?.role !== "K" || Math.abs(to - from) !== 2) return;

    // shift matching rook
    const [rookFrom, rookTo] = CASTLE_ROOK[to];
    const rookKey: BBKey = piece?.color === "w" ? "WR" : "BR";
    this[rookKey] &= ~bit(rookFrom); // lift rook
    this[rookKey] |= bit(rookTo); // drop rook
  }

  private movePiece(from: number, to: number): void {
    const fromMask = bit(from);
    const toMask = bit(to);

    for (const key of KEYS) {
      this[key] &= ~toMask; // clear any captured
      if (this[key] & fromMask) {
        this[key] = (this[key] & ~fromMask) | toMask; // move ours
      }
    }
  }

  private handlePromotion(
    piece: PieceProps | null,
    to: number,
    promotion: string,
  ): void {
    const toMask = bit(to);

    const pawnKey: BBKey = piece?.color === "w" ? "WP" : "BP";
    const promoKey = ((piece?.color === "w" ? "W" : "B") + promotion) as BBKey;

    this[pawnKey] &= ~toMask; // remove pawn
    this[promoKey] |= toMask; // add Q/R/B/N
  }
  // helpers --------------------------

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
  clearBoard() {
    this.WP = this.WN = this.WB = this.WR = this.WQ = this.WK = 0n;
    this.BP = this.BN = this.BB = this.BR = this.BQ = this.BK = 0n;
  }

  private updateCastleRights(sq: number): void {
    switch (sq) {
      case 4:
        this.whiteKingSide = false;
        this.whiteQueenSide = false;
        break; // e1 (king)
      case 0:
        this.whiteQueenSide = false;
        break; // a1 rook
      case 7:
        this.whiteKingSide = false;
        break; // h1 rook
      case 60:
        this.blackKingSide = false;
        this.blackQueenSide = false;
        break; // e8 (king)
      case 56:
        this.blackQueenSide = false;
        break; // a8 rook
      case 63:
        this.blackKingSide = false;
        break; // h8 rook
    }
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

  // setup ----------------
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

  // TODO, other fields, such as castling rules and what not
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

  // -------------------------

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
