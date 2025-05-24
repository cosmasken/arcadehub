import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CoinsIcon, Lightbulb, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const LEVELS = {
  easy: 35,
  medium: 30,
  hard: 25,
};

function generateSudoku(level: keyof typeof LEVELS) {
  // Simple sudoku generator using a fixed solved board and removing cells
  // For production, use a real sudoku generator!
  const solved = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9],
  ];
  const puzzle = solved.map(row => [...row]);
  let cellsToRemove = 81 - LEVELS[level];
  while (cellsToRemove > 0) {
    const i = Math.floor(Math.random() * 9);
    const j = Math.floor(Math.random() * 9);
    if (puzzle[i][j] !== null) {
      puzzle[i][j] = null;
      cellsToRemove--;
    }
  }
  // Track which cells are editable
  const editable = puzzle.map(row => row.map(cell => cell === null));
  return { puzzle, solution: solved, editable };
}

const SudokuGame = () => {
  const [level, setLevel] = useState<keyof typeof LEVELS>("easy");
  const [board, setBoard] = useState<(number | null)[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [editable, setEditable] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [arcBalance, setArcBalance] = useState(100);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    startNewGame(level);
    // eslint-disable-next-line
  }, [level]);

  useEffect(() => {
    if (gameStatus === "playing") {
      const timer = setInterval(() => setElapsed(Date.now() - startTime), 1000);
      return () => clearInterval(timer);
    }
  }, [gameStatus, startTime]);

  function startNewGame(lvl: keyof typeof LEVELS) {
    const { puzzle, solution, editable } = generateSudoku(lvl);
    setBoard(puzzle);
    setSolution(solution);
    setEditable(editable);
    setHintsLeft(3);
    setGameStatus("playing");
    setStartTime(Date.now());
    setElapsed(0);
    setSelectedCell(null);
  }

  function handleCellClick(i: number, j: number) {
    if (gameStatus !== "playing") return;
    if (!editable[i][j]) return;
    setSelectedCell([i, j]);
  }

  function handleInput(num: number) {
    if (!selectedCell || gameStatus !== "playing") return;
    const [i, j] = selectedCell;
    if (!editable[i][j]) return; // Only allow input in editable cells
    const newBoard = board.map(row => [...row]);
    newBoard[i][j] = num;
    setBoard(newBoard);
    checkWin(newBoard);
  }

  function checkWin(bd: (number | null)[][]) {
    for (let i = 0; i < 9; i++)
      for (let j = 0; j < 9; j++)
        if (bd[i][j] !== solution[i][j]) return;
    setGameStatus("won");
    setArcBalance(arcBalance + 25);
    toast.success("Congratulations! You solved the puzzle and earned 25 ARC!");
  }

  function handleHint() {
    if (hintsLeft <= 0) {
      toast.error("No hints left!");
      return;
    }
    if (arcBalance < 5) {
      toast.error("Not enough ARC for a hint!");
      return;
    }
    if (!selectedCell) {
      toast.info("Select a cell to use a hint.");
      return;
    }
    const [i, j] = selectedCell;
    if (!editable[i][j]) {
      toast.info("Cannot use a hint on a fixed cell!");
      return;
    }
    const newBoard = board.map(row => [...row]);
    newBoard[i][j] = solution[i][j];
    setBoard(newBoard);
    setHintsLeft(hintsLeft - 1);
    setArcBalance(arcBalance - 5);
    toast("Hint used (-5 ARC)", { description: `Cell [${i+1},${j+1}] revealed.` });
    checkWin(newBoard);
  }

  function handleReset() {
    startNewGame(level);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center py-12">
      <Card className="w-full max-w-3xl bg-black/50 border-purple-500/30 mb-8">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Sudoku Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <span className="text-purple-300 mr-2">Level:</span>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as keyof typeof LEVELS)}
                className="bg-purple-900/40 border border-purple-500/30 text-white rounded px-3 py-1"
                disabled={gameStatus === "playing" ? false : true}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-purple-300 flex items-center">
                <CoinsIcon className="w-4 h-4 mr-1 text-yellow-400" />
                {arcBalance} ARC
              </span>
              <span className="text-purple-300 flex items-center">
                <Lightbulb className="w-4 h-4 mr-1 text-yellow-200" />
                {hintsLeft} Hints
              </span>
              <span className="text-purple-300">
                Time: {Math.floor(elapsed / 1000)}s
              </span>
              <Button size="sm" variant="outline" onClick={handleReset} className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                <RefreshCw className="w-4 h-4 mr-1" /> Reset
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse">
              <tbody>
                {board.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`w-10 h-10 md:w-12 md:h-12 border border-purple-500/30 text-center align-middle text-lg md:text-xl font-bold transition-colors
                          ${selectedCell && selectedCell[0] === i && selectedCell[1] === j ? "bg-purple-700/60" : "bg-black/30"}
                          ${cell === null ? "text-purple-300" : "text-white"}
                          ${editable[i] && editable[i][j] ? "cursor-pointer" : "bg-purple-900/30 cursor-not-allowed"}
                          ${((i+1)%3===0 && i!==8 ? "border-b-4 border-purple-700" : "")}
                          ${((j+1)%3===0 && j!==8 ? "border-r-4 border-purple-700" : "")}
                        `}
                        onClick={() => handleCellClick(i, j)}
                      >
                        {cell !== null ? cell : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <Button
                key={num}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold w-10 h-10"
                onClick={() => handleInput(num)}
                disabled={gameStatus !== "playing"}
              >
                {num}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 w-16"
              onClick={handleHint}
              disabled={gameStatus !== "playing"}
            >
              <Lightbulb className="w-4 h-4 mr-1" /> Hint (-5 ARC)
            </Button>
          </div>
          {gameStatus === "won" && (
            <div className="mt-6 text-green-400 text-xl font-bold text-center">
              🎉 Puzzle Solved! +25 ARC
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SudokuGame;