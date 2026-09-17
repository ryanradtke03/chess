export const FENS: string[] = [
  "Q7/8/8/8/8/8/8/8", // 0:  white queen a8 — orientation check
  "8/8/8/8/8/8/8/7Q", // 1:  white queen h1 — orientation check
  "8/8/8/8/8/8/8/8", // 2:  empty board
  "r6r/8/8/8/8/8/8/R6R", // 3:  rooks in all 4 corners
  "4k3/8/8/8/8/8/8/4K3", // 4:  black king e8, white king e1
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", // 5:  standard start position
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR", // 6:  after 1.e4 e5
  "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R", // 7:  Ruy Lopez
  "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R", // 8:  double castle setup

  // --- PROMOTION ---
  "4k3/P7/8/8/8/8/8/4K3 w - - 0 1", // 9:  white pawn a7 → push a8 promotes
  "n3k3/1P6/8/8/8/8/8/4K3 w - - 0 1", // 10: white pawn b7 → push b8 OR capture a8 (knight), both promote
  "4k3/8/8/8/8/8/p7/4K3 b - - 0 1", // 11: black pawn a2 → push a1 promotes (black to move)
  "4k3/P6P/8/8/8/8/p6p/4K3 w - - 0 1", // 12: promo pawns on both sides + both files

  // --- EXTRA TEST POSITIONS ---
  "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1", // 13: white castling both ways
  "4k3/4r3/8/8/8/8/8/4K3 w - - 0 1", // 14: white king in check (must escape)
];
