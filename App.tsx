
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './services/GameEngine';
import { GameStatus } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { Play, RotateCcw, Trophy, AlertCircle, ArrowRight, Repeat } from 'lucide-react';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [score, setScore] = useState(0);

  // Game Loop Setup
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Initialize Engine
    const engine = new GameEngine(
      ctx,
      () => setStatus(GameStatus.GAME_OVER),
      () => setStatus(GameStatus.VICTORY),
      () => setStatus(GameStatus.LEVEL_COMPLETE),
      (s) => setScore(s)
    );
    engineRef.current = engine;

    let animationFrameId: number;

    const render = () => {
      engine.update();
      engine.draw();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (engineRef.current) engineRef.current.handleInput(e.code, true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current) engineRef.current.handleInput(e.code, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    if (engineRef.current) {
      engineRef.current.start(1); // Start at level 1
      setStatus(GameStatus.PLAYING);
    }
  };

  const nextLevel = () => {
    if (engineRef.current) {
      engineRef.current.nextLevel();
      setStatus(GameStatus.PLAYING);
    }
  };

  const retryLevel = () => {
    if (engineRef.current) {
      engineRef.current.retryCurrentLevel();
      setStatus(GameStatus.PLAYING);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700 bg-black">
        
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-sky-300"
        />

        {/* HUD - Score */}
        {status === GameStatus.PLAYING && (
          <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded font-mono text-xl border border-white/20">
            スコア: {score.toString().padStart(5, '0')}
          </div>
        )}

        {/* Controls Hint */}
        <div className="absolute bottom-2 right-4 text-white/50 text-xs font-mono">
          矢印キー: 移動 & ジャンプ
        </div>

        {/* Main Menu Overlay */}
        {status === GameStatus.MENU && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-8 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 drop-shadow-lg text-center">
              ごまめちゃんの<br/>大冒険
            </h1>
            <p className="mb-8 text-gray-300 max-w-md text-center">
              全4ステージの冒険へ出発しよう！<br/>
              敵を踏んで倒して、ゴールを目指せ！
            </p>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-8 border border-gray-700 flex items-center gap-4">
               <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-2xl">
                 🏃‍♀️
               </div>
               <div className="text-sm text-gray-400">
                 <span className="font-bold text-white">キャラクター:</span><br/>ごまめちゃん（ピクセル生成済）
               </div>
            </div>

            <button
              onClick={startGame}
              className="group relative px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-xl transition-all transform hover:scale-105 flex items-center gap-3"
            >
              <Play className="w-6 h-6 fill-current" />
              ゲームスタート
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center text-white animate-fade-in gap-4">
            <AlertCircle className="w-20 h-20 text-red-300" />
            <h2 className="text-5xl font-bold">ゲームオーバー</h2>
            <p className="text-xl text-red-200 mb-4">最終スコア: {score}</p>
            
            <div className="flex gap-4">
              <button
                onClick={retryLevel}
                className="px-6 py-3 bg-white text-red-900 hover:bg-gray-100 font-bold rounded-lg text-lg transition-transform transform hover:scale-105 flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                このステージからやり直す
              </button>
              
              <button
                onClick={startGame}
                className="px-6 py-3 bg-red-800 text-red-100 hover:bg-red-700 font-bold rounded-lg text-lg transition-colors flex items-center gap-2"
              >
                <Repeat className="w-5 h-5" />
                最初から
              </button>
            </div>
          </div>
        )}

        {/* Level Complete Overlay */}
        {status === GameStatus.LEVEL_COMPLETE && (
          <div className="absolute inset-0 bg-blue-900/80 flex flex-col items-center justify-center text-white animate-fade-in">
            <h2 className="text-6xl font-bold mb-4 text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] tracking-wider">
              GOAL!
            </h2>
            <p className="text-xl mb-8 text-blue-100">ステージクリア！</p>
            <button
              onClick={nextLevel}
              className="px-8 py-4 bg-yellow-400 text-yellow-900 hover:bg-yellow-300 font-bold rounded-lg text-xl transition-all transform hover:scale-105 flex items-center gap-3"
            >
              次のステージへ
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Victory Overlay */}
        {status === GameStatus.VICTORY && (
          <div className="absolute inset-0 bg-yellow-900/95 flex flex-col items-center justify-center text-white animate-fade-in text-center p-4">
            <h2 className="text-4xl font-bold mb-4 text-yellow-400 drop-shadow-md">全ステージクリア！</h2>
            
            {/* Victory Image Container */}
            <div className="relative w-72 h-auto max-h-[400px] mb-6 rounded-xl overflow-hidden border-4 border-yellow-400 shadow-2xl bg-black/20">
               <img 
                 src="victory.png" 
                 alt="Thank you for playing!" 
                 className="w-full h-full object-contain"
                 onError={(e) => {
                   // Fallback if victory.png is not found
                   e.currentTarget.src = "https://via.placeholder.com/400x300/FBBF24/000000?text=Thank+You!";
                   e.currentTarget.onerror = null;
                 }}
               />
            </div>

            <p className="text-2xl mb-6 text-white font-bold drop-shadow-md">
              ここまで遊んでくれてありがとう
            </p>
            
            <p className="text-xl mb-6 text-yellow-100 font-mono">最終スコア: {score}</p>
            
            <button
              onClick={startGame}
              className="px-8 py-3 bg-yellow-400 text-yellow-900 hover:bg-yellow-300 font-bold rounded-lg text-lg transition-colors flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              最初から遊ぶ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
