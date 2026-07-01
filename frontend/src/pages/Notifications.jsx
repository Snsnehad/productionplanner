import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BellRing, BellOff, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { getNotifications, acknowledgeNotification, resolveNotification } from "../api/notifications";
import StatusBadge from "../components/Common/StatusBadge.jsx";
import Spinner from "../components/Common/Spinner.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";

const STATUSES = ["pending", "acknowledged", "resolved"];

const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const Notifications = () => {
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", status],
    queryFn: () => getNotifications(status ? { status } : {}),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-shortages"] });
  };

  const ackMutation = useMutation({
    mutationFn: acknowledgeNotification,
    onSuccess: () => { toast.success("Acknowledged — reminders paused"); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to acknowledge"),
  });

  const resolveMutation = useMutation({
    mutationFn: resolveNotification,
    onSuccess: () => { toast.success("Resolved — reminders stopped"); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to resolve"),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatus("")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${!status ? "bg-teal-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${status === s ? "bg-teal-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="panel overflow-x-auto">
        {isLoading ? (
          <Spinner />
        ) : !notifications?.length ? (
          <EmptyState icon={BellRing} title="No notifications" description="Shortage alerts will appear here once a plan runs short on materials." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Purchaser</th>
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Reminder Count</th>
                <th className="px-5 py-3">Last Sent</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <tr key={n._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">
                    <Link to={`/notifications/${n._id}`} className="hover:text-teal-700">{n.purchaserId?.name}</Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{n.materialId?.materialName}</td>
                  <td className="figure px-5 py-3 text-slate-600">{n.planId?.planNumber}</td>
                  <td className="figure px-5 py-3 text-slate-600">{n.reminderCount}</td>
                  <td className="figure px-5 py-3 text-slate-600">{formatDateTime(n.lastSentAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={n.status} /></td>
                  <td className="px-5 py-3 text-right">
                    {n.status !== "resolved" && (
                      <div className="flex justify-end gap-1.5">
                        {n.status === "pending" && (
                          <button
                            onClick={() => ackMutation.mutate(n._id)}
                            disabled={ackMutation.isPending}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                            title="Acknowledge"
                          >
                            <BellOff size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => resolveMutation.mutate(n._id)}
                          disabled={resolveMutation.isPending}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                          title="Mark Resolved"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Notifications;
