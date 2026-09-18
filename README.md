# Chess

Play chess against a bitboard + alpha-beta engine, in the browser. React · TypeScript · Vite.

<!-- Add a screenshot or GIF of a game here — it sells the project better than any paragraph. -->
<!-- ![Screenshot](public/screenshot.png) -->

## Features

- **Play against the engine** — you play White, the engine replies as Black.
- **Full legal move generation** — including castling, en passant, and promotion.
- **Game-state detection** — check, checkmate, and stalemate.
- **Promotion picker** — choose your piece when a pawn reaches the last rank.
- **Move sounds** and a clean Tailwind board UI.

## How it works

The interesting part lives in `src/engine/`:

- **Board representation (`board.ts`)** — the position is stored as twelve bitboards, one 64-bit integer (`bigint`) per piece type and color. Moves are made by flipping bits, and castling rights / en passant targets are tracked alongside.
- **Move generation (`movegen.ts`)** — generates fully legal moves (moves that leave your own king in check are filtered out), and exposes `isKingInCheck`, `allLegalMoves`, and a `perft` helper for correctness testing.
- **Search (`search.ts`)** — a negamax search with alpha-beta pruning (default depth 4). Positions are scored by material value plus piece-square tables, so the engine develops pieces and keeps its king tucked away rather than just counting material.

## Getting started

```bash
npm install
npm run dev      # start the dev server (Vite + HMR)
npm run build    # type-check and build for production
npm run preview  # preview the production build
npm run lint     # run Oxlint
```

Then open the URL Vite prints (default http://localhost:5173).

## Project structure

```
src/
├── App.tsx              # top-level game state, click handling, bot turn
├── components/          # Board, Piece, PromotionDialog
├── engine/
│   ├── board.ts         # bitboard representation + makeMove
│   ├── movegen.ts       # legal move generation, check detection, perft
│   ├── game.ts          # turn/status tracking on top of the board
│   └── search.ts        # negamax + alpha-beta, material + PST evaluation
├── utils/               # square/bit helpers, logging
├── types.ts             # shared types (Move, PieceColor, bitboard keys, …)
└── fens.ts              # FEN strings for testing positions
```

## Roadmap

Tracked in [Issues](https://github.com/ryanradtke03/chess/issues):

- [ ] [Last-move highlight](https://github.com/ryanradtke03/chess/issues/1)
- [ ] [Check indicator](https://github.com/ryanradtke03/chess/issues/2)
- [x] Board coordinates (a–h / 1–8 labels)
- [ ] [Move-history panel](https://github.com/ryanradtke03/chess/issues/4) (algebraic notation)
- [ ] [Board flip](https://github.com/ryanradtke03/chess/issues/5) (view from Black's side)
- [ ] [Jump-back navigation](https://github.com/ryanradtke03/chess/issues/6) through move history
