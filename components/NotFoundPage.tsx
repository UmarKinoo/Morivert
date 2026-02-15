import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl font-extralight tracking-tighter text-white mb-2">404</div>
        <h1 className="text-lg font-medium text-white mb-2">Page not found</h1>
        <p className="text-sm text-zinc-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-emerald-500 text-black text-sm font-semibold rounded-xl hover:bg-emerald-400 transition-colors"
          >
            Go home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-zinc-700 text-sm text-zinc-300 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};
