import GameOver from './gameoverPopup';
import { GameText } from './spoonHelper';

export function GameShell({ gameName, canvasRef, gameState, canvasStyle,  gameOverProps = {}, children }) {
  const { gameOverState, paused, setPaused, restartRef, pauseRef, resumeRef, beginResume, resumeCountdown,
          playButtonText, canvasHeight, ...restGameState } = gameState;
  function handlePauseClick() {
    if (pauseRef.current) pauseRef.current();
    setPaused(true);
  }

  const modalVisible = gameOverState || paused;
  const countingDown = resumeCountdown !== null && resumeCountdown > 0;
  const pauseButtonHidden = modalVisible || countingDown;
  return (
    <div className="notscene">
      <div>
        <GameOver
          visible={modalVisible}
          paused={paused}
          onRestart={() => restartRef.current()}
          onResume={beginResume}
          playButtonText={playButtonText}
          {...restGameState}
          {...gameOverProps}
        />
      </div>
      <div className="game-canvas-wrapper">
        <canvas className="game-canvas" ref={canvasRef} style={canvasStyle} />
        {children}
        {countingDown && <div className="resume-countdown">{resumeCountdown}</div>}
        <GameText gameName={gameName} canvasHeight={canvasHeight} />
      </div>
      <button
        type="button"
        className="pause-button"
        style={{ display: pauseButtonHidden ? "none" : "block", '--canvas-height': `${canvasHeight}px` }}
        onClick={handlePauseClick}
      >
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
    </div>
  );
}