import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, CalendarRange } from "lucide-react";
import { getPlans } from "../api/plans";
import StatusBadge from "../components/Common/StatusBadge.jsx";
import Spinner from "../components/Common/Spinner.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";

const DEPARTMENTS = ["Winding", "Core", "CCA", "Tanking", "Testing"];
const STATUSES = ["draft", "approved", "completed", "cancelled"];

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const ProductionPlans = () => {
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans", department, status],
    queryFn: () => getPlans({ ...(department && { department }), ...(status && { status }) }),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="field-input w-auto">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="field-input w-auto capitalize">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
        <Link to="/plans/new" className="btn-primary">
          <Plus size={16} />
          Create Production Plan
        </Link>
      </div>

      <div className="panel overflow-x-auto">
        {isLoading ? (
          <Spinner />
        ) : !plans?.length ? (
          <EmptyState icon={CalendarRange} title="No production plans found" description="Create a plan to start checking material availability." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Plan Number</th>
                <th className="px-5 py-3">Plan Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Materials</th>
                <th className="px-5 py-3">Start Date</th>
                <th className="px-5 py-3">End Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => (
                <tr key={plan._id} className="hover:bg-slate-50">
                  <td className="figure px-5 py-3 font-medium text-slate-900">
                    <Link to={`/plans/${plan._id}`} className="hover:text-teal-700">{plan.planNumber}</Link>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{plan.planName}</td>
                  <td className="px-5 py-3 text-slate-600">{plan.department}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {!plan.materials?.length ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        plan.materials.slice(0, 3).map((pm) => (
                          <span
                            key={pm._id}
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                              pm.shortageQty > 0 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {pm.materialId?.materialName} <span className="figure ml-1">{pm.requiredQty}{pm.materialId?.unit}</span>
                          </span>
                        ))
                      )}
                      {plan.materials?.length > 3 && (
                        <span className="text-xs text-slate-400">+{plan.materials.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="figure px-5 py-3 text-slate-600">{formatDate(plan.startDate)}</td>
                  <td className="figure px-5 py-3 text-slate-600">{formatDate(plan.endDate)}</td>
                  <td className="px-5 py-3"><StatusBadge status={plan.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductionPlans;
