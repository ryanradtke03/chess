import { useEffect, useState } from "react";
import Board from "./components/Board";
import PromotionDialog from "./components/PromotionDialog";
import type { Board as ChessBoard } from "./engine/board";
import { Game } from "./engine/game";
import * as movegen from "./engine/movegen";
import type { Move, PieceColor, PieceRole } from "./types";
import { squareToBit } from "./utils/utils";

import moveSoundUrl from "./assets/public_sound_standard_Move.mp3";
const moveSound = new Audio(moveSoundUrl);

function playMoveSound() {
  moveSound.currentTime = 0; // rewind so rapid moves always fire
  moveSound.play().catch(() => {}); // swallow autoplay-policy errors
}

function App() {
  // holds a game
  const [game, setGame] = useState(() => new Game()); //FENS[12]

  // which square selected
  const [selected, setSelected] = useState<number | null>(null);

  // valid move positions
  const [targets, setTargets] = useState<number[]>([]);

  // promotion choice pending

  const [pending, setPending] = useState<{ from: number; to: number } | null>(
    null,
  );
  const promoColor: PieceColor = pending && pending.to >= 56 ? "w" : "b";

  useEffect(() => {
    if (game.status !== "ongoing") return;
    if (game.toMove !== "b") return;

    const id = setTimeout(() => {
      const move = pickRandomMove(game.board, "b");
      if (move) {
        // make the move
        setGame((prev) => {
          const next = prev.clone();
          next.move(move);
          playMoveSound();
          return next;
        });
      }
    }, 832);
    return () => clearTimeout(id);
  }, [game.toMove, game.status]);

  // main -----------------------------------
  function handleSquareClick(i: number) {
    // first click
    if (selected === null) {
      const from = squareToBit(i);
      const piece = game.board.pieceAt(from);

      // only select your own piece
      if (!piece || piece.color !== game.toMove) return;

      setSelected(i);

      // find moves from piece
      const moves = movegen.legalMovesFrom({
        board: game.board,
        square: from,
        color: game.toMove,
      });

      // update targets to valid moves
      setTargets(moves.map((m) => squareToBit(m.to)));
      return;
    } else {
      // second click
      const from = squareToBit(selected);
      const to = squareToBit(i);
      const piece = game.board.pieceAt(from);
      const lastRank = piece?.color === "w" ? 7 : 0;

      // promotion? pause and show the dialog instead of moving
      if (piece?.role === "P" && Math.floor(to / 8) === lastRank) {
        setPending({ from, to });
        setSelected(null);
        return;
      }

      // make the move
      setGame((prev) => {
        const next = prev.clone();
        next.move({ from: squareToBit(selected), to: squareToBit(i) });
        playMoveSound();
        return next;
      });

      // reset
      setSelected(null);
      setTargets([]);
    }
  }

  function choosePromotion(role: PieceRole) {
    if (!pending) return;

    // make move with promotion flag
    setGame((prev) => {
      const next = prev.clone();
      next.move({ from: pending.from, to: pending.to, promotion: role });
      playMoveSound();
      return next;
    });

    // reset
    setPending(null);
  }

  function pickRandomMove(board: ChessBoard, color: PieceColor): Move | null {
    const moves = movegen.allLegalMoves(board, color);
    if (moves.length === 0) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-800 text-neutral-100">
      {/* whose turn */}
      <div className="flex items-center gap-2 text-lg font-semibold">
        <span
          className="inline-block h-4 w-4 rounded-full border border-neutral-400"
          style={{
            backgroundColor: game.toMove === "w" ? "#f0f0f0" : "#202020",
          }}
        />
        {game.status === "ongoing"
          ? `${game.toMove === "w" ? "White" : "Black"} to move`
          : "Game over"}
      </div>

      <div className="relative">
        <Board
          targets={targets}
          selected={selected}
          onSquareClick={handleSquareClick}
          squares={game.board.toSquares()}
        />

        {pending && (
          <PromotionDialog
            color={promoColor}
            onSelect={choosePromotion}
            onCancel={() => setPending(null)}
          />
        )}

        {/* game-over overlay */}
        {game.status !== "ongoing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="rounded-lg bg-white px-6 py-4 text-center text-xl font-bold text-neutral-900">
              {game.status === "checkmate"
                ? `Checkmate — ${game.toMove === "w" ? "Black" : "White"} wins`
                : "Stalemate — draw"}
              <button
                className="mt-3 block w-full rounded bg-neutral-800 px-4 py-2 text-sm font-medium text-white"
                onClick={() => {
                  setGame(new Game());
                  playMoveSound();
                  setSelected(null);
                  setPending(null);
                }}
              >
                New game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* dev only */}
    </div>
  );
}

export default App;
