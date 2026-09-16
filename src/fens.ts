export const FENS: string[] = [
  "Q7/8/8/8/8/8/8/8", // 0: white queen top-left (a8) — orientation check
  "8/8/8/8/8/8/8/7Q", // 1: white queen bottom-right (h1) — orientation check
  "8/8/8/8/8/8/8/8", // 2: empty board
  "r6r/8/8/8/8/8/8/R6R", // 3: rooks in all 4 corners
  "4k3/8/8/8/8/8/8/4K3", // 4: black king e8, white king e1
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", // 5: standard start position
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR", // 6: after 1.e4 e5
  "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R", // 7: Ruy Lopez
  "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R", // 8: double castle set up
];
