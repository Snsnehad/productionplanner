// Dashboard summary card: a label, a big mono figure, and an accent-colored icon chip.
const ACCENTS = {
  teal: "bg-teal-50 text-teal-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  emerald: "bg-emerald-50 text-emerald-700",
};

const SummaryCard = ({ label, value, icon: Icon, accent = "teal" }) => {
  return (
    <div className="panel flex items-center justify-between p-5">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="figure mt-1 text-3xl font-semibold text-slate-900">{value}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${ACCENTS[accent]}`}>
        {Icon ? <Icon size={20} /> : null}
      </div>
    </div>
  );
};

export default SummaryCard;
