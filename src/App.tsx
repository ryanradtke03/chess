import { useState } from "react";
import Board from "./components/Board";
import PromotionDialog from "./components/PromotionDialog";
import { Board as ChessBoard } from "./engine/board";
import { Game } from "./engine/game";
import { perft } from "./engine/movegen";
import type { PieceColor, PieceRole } from "./types";

function App() {
  const [game, setGame] = useState(() => new Game()); //FENS[12]
  const [selected, setSelected] = useState<number | null>(null);
  const [pending, setPending] = useState<{ from: number; to: number } | null>(
    null,
  );

  function squareToBit(i: number): number {
    return (7 - Math.floor(i / 8)) * 8 + (i % 8);
  }

  function handleSquareClick(i: number) {
    if (selected === null) {
      // First click
      setSelected(i);
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-800">
      <button
        onClick={() => {
          console.time("perft");
          console.log("perft(2):", perft(new ChessBoard(), "w", 3));
          console.timeEnd("perft");
        }}
      >
        run perft
      </button>
      <div className="relative">
        <Board
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
      </div>
    </div>
  );
}

export default App;
