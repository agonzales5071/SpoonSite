import { Link } from 'react-router-dom';
import '../spoondrop.css';

const GameOver = ({
  message, scoreText, visible, onRestart, onResume, playButtonText,
  personalBest, topScores, view, setView, isNewPB,
  onRestartDarkSide, mobile, paused
}) => {
  const dateFormatOptions = { year: '2-digit', month: 'numeric', day: 'numeric' };
  const darkSideVisible = onRestartDarkSide != null && personalBest !== null;

  return (
    <div id="sd-modal-wrapper" style={{ display: visible ? "flex" : "none" }}>
      <div id="sd-modal">
        <div id="sd-modal-background" style={{
          backgroundImage: view === 'personalBest' ? 'url("/images/crowns.png")' : 'url("/images/curves2_tileable2.png")',
          backgroundSize: view === 'personalBest' ? '100px 100px' : '384px 256px',
          animation: view === 'personalBest' ? 'move-background-crowns 10s linear infinite' : 'move-background-menu 10s linear infinite'
        }}></div>
        <div id="sd-modal-content">

          {view === 'gameover' && (
            <>
              {topScores.length > 0 && (
                <button type="button" className="sd-modal-action" id="leaderboard-action" style={{height: 'fit-content'}}onClick={() => setView('personalBest')}>
                  <span className="icon-span"></span>
                  <div className="sd-modal-action-pattern"></div>
                  <div className="sd-modal-action-fade"></div>
                </button>
              )}
              <div id="sd-modal-message">
                {paused ? (
                  <p className="sd-message" style={topScores.length > 0 ? {} : {marginTop: '10%'}}>Paused</p>
                ) : (
                  <>
                    <p className="sd-message" style={topScores.length > 0 ? {} : {marginTop: '10%'}}>{message}</p>
                  </>
                )}
                <p className="sd-score-text">{scoreText}</p>
                {personalBest !== null && (
                  <p className="sd-personal-best">
                    {isNewPB ? `New personal best! ${personalBest}` : `Personal best: ${personalBest}`}
                  </p>
                )}
              </div>
              <div id="sd-modal-actions" style={{ flexDirection: darkSideVisible && mobile && !paused ? "column" : "row" }}>
                <button type="button" className="sd-modal-action" id="restart-action" onClick={paused ? onResume : onRestart}>
                  <div className="sd-modal-action-pattern"></div>
                  <div className="sd-modal-action-fade"></div>
                  <span className="sd-modal-action-text inter-font">{paused ? "Resume" : playButtonText}</span>
                </button>
                {!paused && onRestartDarkSide && (
                  <button
                    type="button"
                    className="sd-modal-action"
                    id="darkside-action"
                    onClick={onRestartDarkSide}
                    style={{ display: darkSideVisible ? "flex" : "none" }}
                  >
                    <div className="sd-modal-action-pattern"></div>
                    <div className="sd-modal-action-fade" id="darkside-action-fade"></div>
                    <span className="darkside-modal-action-text inter-font">Dark Side</span>
                  </button>
                )}
                <Link to="/games" className="sd-modal-link">
                  <button type="button" className="sd-modal-action" id="game-menu-action">
                    <div className="sd-modal-action-pattern"></div>
                    <div className="sd-modal-action-fade"></div>
                    <span className="sd-modal-action-text inter-font">Back</span>
                  </button>
                </Link>
              </div>
            </>
          )}

          {view === 'personalBest' && (
            <>
              <div id="sd-modal-message">
                <p className="sd-message">Your Top Scores</p>
                <ol className="sd-score-list">
                  {topScores.map((entry, i) => (
                    <li key={i}>
                      {entry.score} — {new Date(entry.date).toLocaleDateString('en-US', dateFormatOptions)}
                    </li>
                  ))}
                </ol>
              </div>
              <div id="sd-modal-actions">
                <button type="button" className="sd-modal-action" id="restart-action" onClick={() => setView('gameover')}>
                  <div className="sd-modal-action-pattern"></div>
                  <div className="sd-modal-action-fade"></div>
                  <span className="sd-modal-action-text inter-font">Back</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default GameOver;