// Signature element: a small horizontal gauge showing required vs. available stock
// at a glance, instead of forcing the reader to do the subtraction themselves.
const StockBar = ({ required, available }) => {
  const pct = required > 0 ? Math.min(100, Math.round((available / required) * 100)) : 100;
  const isShort = available < required;

  return (
    <div className="w-32">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${isShort ? "bg-red-500" : "bg-teal-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="figure mt-1 text-[11px] text-slate-500">{pct}% covered</p>
    </div>
  );
};

export default StockBar;
