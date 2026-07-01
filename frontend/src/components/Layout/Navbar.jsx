import { useState } from "react";
import { LogOut, ChevronDown, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_LABELS = {
  admin: "Admin",
  planner: "Planner",
  purchaser: "Purchaser",
};

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur lg:pl-6">
      <h1 className="font-display text-lg font-semibold text-slate-900">{title}</h1>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <User size={16} />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block leading-tight">{user?.name}</span>
            <span className="block text-xs leading-tight text-slate-400">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </span>
          <ChevronDown size={15} className="text-slate-400" />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
