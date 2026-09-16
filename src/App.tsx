import { useState } from "react";
import Board from "./components/Board";
import { Game } from "./engine/game";
import { FENS } from "./fens";

function App() {
  const [game, setGame] = useState(() => new Game(FENS[7]));
  const [selected, setSelected] = useState<number | null>(null);

  function handleSquareClick(i: number) {
    if (selected == null) {
      // First click
      setSelected(i);
    } else {
      // Second click
      setSelected(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-800">
      <Board
        selected={selected}
        onSquareClick={handleSquareClick}
        squares={game.board.toSquares()}
      />
    </div>
  );
}

export default App;
