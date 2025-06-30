import { GameProvider } from './context';
import TetrisGame from './TetrisGame';

export const Tetris = () => (
  <GameProvider>
    <TetrisGame />
  </GameProvider>
);

export default Tetris;
