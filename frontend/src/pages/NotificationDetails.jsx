import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, BellOff } from "lucide-react";
import toast from "react-hot-toast";
import { getNotification, acknowledgeNotification, resolveNotification } from "../api/notifications";
import StatusBadge from "../components/Common/StatusBadge.jsx";
import Spinner from "../components/Common/Spinner.jsx";

const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const NotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notification, isLoading } = useQuery({
    queryKey: ["notification", id],
    queryFn: () => getNotification(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notification", id] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };

  const ackMutation = useMutation({
    mutationFn: acknowledgeNotification,
    onSuccess: () => { toast.success("Notification acknowledged"); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to acknowledge"),
  });

  const resolveMutation = useMutation({
    mutationFn: resolveNotification,
    onSuccess: () => { toast.success("Notification resolved"); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to resolve"),
  });

  if (isLoading) return <Spinner />;
  if (!notification) return null;

  const { planId: plan, materialId: material, purchaserId: purchaser } = notification;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link to="/notifications" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} />
        Back to notifications
      </Link>

      <div className="panel p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">Material Shortage Alert</h2>
            <p className="mt-1 text-sm text-slate-500">{plan?.department} &middot; {plan?.planNumber}</p>
          </div>
          <StatusBadge status={notification.status} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-y-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Material</p>
            <p className="mt-0.5 font-medium text-slate-900">{material?.materialName}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Shortage Qty</p>
            <p className="figure mt-0.5 font-semibold text-red-600">{notification.shortageQty} {material?.unit}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Purchaser</p>
            <p className="mt-0.5 text-slate-700">{purchaser?.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Purchaser Email</p>
            <p className="mt-0.5 text-slate-700">{purchaser?.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Reminders Sent</p>
            <p className="figure mt-0.5 text-slate-700">{notification.reminderCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Last Sent</p>
            <p className="figure mt-0.5 text-slate-700">{formatDateTime(notification.lastSentAt)}</p>
          </div>
          {notification.status === "resolved" && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Resolved At</p>
              <p className="figure mt-0.5 text-slate-700">{formatDateTime(notification.resolvedAt)}</p>
            </div>
          )}
        </div>

        {notification.status !== "resolved" && (
          <div className="mt-6 flex gap-2 border-t border-slate-200 pt-5">
            {notification.status === "pending" && (
              <button onClick={() => ackMutation.mutate(id)} disabled={ackMutation.isPending} className="btn-secondary">
                <BellOff size={15} />
                Acknowledge
              </button>
            )}
            <button onClick={() => resolveMutation.mutate(id)} disabled={resolveMutation.isPending} className="btn-primary">
              <CheckCircle2 size={15} />
              Mark Resolved
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetails;
