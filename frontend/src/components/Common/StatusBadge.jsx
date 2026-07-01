// Renders a colored pill for plan/notification statuses, consistent across the app.
const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-600",
  approved: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-500 line-through",
  pending: "bg-amber-50 text-amber-700",
  acknowledged: "bg-blue-50 text-blue-700",
  resolved: "bg-emerald-50 text-emerald-700",
  sufficient: "bg-emerald-50 text-emerald-700",
  shortage: "bg-red-50 text-red-700",
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
