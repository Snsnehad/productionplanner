import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Boxes,
  Users,
  Link2,
  CalendarRange,
  BellRing,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/plans", label: "Production Plans", icon: CalendarRange },
  { to: "/notifications", label: "Notifications", icon: BellRing },
  { to: "/materials", label: "Materials Master", icon: Boxes },
  { to: "/purchasers", label: "Purchasers Master", icon: Users },
  { to: "/mapping", label: "Material Mapping", icon: Link2 },
];

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
          <Zap size={16} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-tight text-slate-900">Transformer MMS</p>
          <p className="text-[11px] leading-tight text-slate-400">Material &amp; Procurement</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-6 py-4">
        <p className="text-[11px] text-slate-400">Planning &amp; Procurement v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
