import { useNavigate, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const GameLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <button
        onClick={() => navigate(-1)}
        className="m-4 flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded hover:bg-purple-700/60 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default GameLayout;