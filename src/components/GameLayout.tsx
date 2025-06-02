import { useNavigate, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const GameLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center">
      <div className="w-full flex justify-center mt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded hover:bg-purple-700/60 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>
      <div
        className="flex flex-col items-center justify-center bg-black/60 rounded-2xl shadow-2xl p-6 mt-8"
        style={{
          width: 420,
          height: 560,
          maxWidth: '95vw',
          maxHeight: '80vh',
          minWidth: 320,
          minHeight: 400,
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default GameLayout;