import { Link } from 'react-router-dom';
import GameOver from './gameoverPopup';
import { GameText } from './spoonHelper';

export function GameShell({ gameName, canvasRef, gameState, canvasStyle,  gameOverProps = {}, children }) {
  const { gameOverState, restartRef, playButtonText, canvasHeight, ...restGameState} = gameState;

  return (
    <div className="notscene">
      <div>
        <GameOver
          visible={gameOverState}
          onRestart={() => restartRef.current()}
          playButtonText={playButtonText}
          {...restGameState}
          {...gameOverProps}
        />
      </div>
      <div className="game-canvas-wrapper">
        <canvas className="game-canvas" ref={canvasRef} style={canvasStyle}/>
        {children /* for extras like the HUD canvas in SpoonSaberBattle */}
        <GameText gameName={gameName} canvasHeight={canvasHeight} />
      </div>
      <Link to="/games">
        <button className="back-button" style={{ display: gameOverState ? "none" : "block" }} />
      </Link>
    </div>
  );
}