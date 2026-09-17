import { useState } from "react";
import Board from "./components/Board";
import PromotionDialog from "./components/PromotionDialog";
import { Board as ChessBoard } from "./engine/board";
import { Game } from "./engine/game";
import { legalMovesFrom, perft } from "./engine/movegen";
import type { PieceColor, PieceRole } from "./types";

function App() {
  const [game, setGame] = useState(() => new Game()); //FENS[12]
  const [selected, setSelected] = useState<number | null>(null);
  const [pending, setPending] = useState<{ from: number; to: number } | null>(
    null,
  );
  const [targets, setTargets] = useState<number[]>([]);

  function squareToBit(i: number): number {
    return (7 - Math.floor(i / 8)) * 8 + (i % 8);
  }

  function handleSquareClick(i: number) {
    if (selected === null) {
      // First click
      const from = squareToBit(i);
      const piece = game.board.pieceAt(from);
      if (!piece || piece.color !== game.toMove) return; // only select your own piece

      setSelected(i);
      const moves = legalMovesFrom({
        board: game.board,
        square: from,
        color: game.toMove,
      });
      setTargets(moves.map((m) => squareToBit(m.to))); // bit → render index
      return;
    } else {
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

      // normal move
      setGame((prev) => {
        const next = prev.clone();
        next.move({ from: squareToBit(selected), to: squareToBit(i) });
        return next;
      });
      setSelected(null);
      setTargets([]);
    }
  }

  function choosePromotion(role: PieceRole) {
    if (!pending) return;
    setGame((prev) => {
      const next = prev.clone();
      next.move({ from: pending.from, to: pending.to, promotion: role });
      return next;
    });
    setPending(null);
  }

  const promoColor: PieceColor = pending && pending.to >= 56 ? "w" : "b";

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
      <button
        className="text-sm text-neutral-400 underline"
        onClick={() => {
          console.time("perft");
          console.log("perft(3):", perft(new ChessBoard(), "w", 3));
          console.timeEnd("perft");
        }}
      >
        run perft
      </button>
    </div>
  );
}

export default App;
