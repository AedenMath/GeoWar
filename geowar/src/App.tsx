import React from 'react';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div className="text-6xl font-bold mb-4">
        <span className="text-neon">GEO</span>
        <span className="text-neon-gold">WAR</span>
      </div>
      <p className="text-gray-400 uppercase tracking-widest">
        Chargement du monde...
      </p>
      <div className="mt-8 text-5xl animate-spin" style={{ animationDuration: '3s' }}>
        🌍
      </div>
    </div>
  );
};

export default App;
