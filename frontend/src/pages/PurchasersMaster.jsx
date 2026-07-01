import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { getPurchasers, createPurchaser, updatePurchaser, deletePurchaser } from "../api/purchasers";
import Modal from "../components/Common/Modal.jsx";
import Spinner from "../components/Common/Spinner.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";

const PurchasersMaster = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: purchasers, isLoading } = useQuery({
    queryKey: ["purchasers", search],
    queryFn: () => getPurchasers(search ? { search } : {}),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["purchasers"] });

  const createMutation = useMutation({
    mutationFn: createPurchaser,
    onSuccess: () => { toast.success("Purchaser added"); invalidate(); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add purchaser"),
  });

  const updateMutation = useMutation({
    mutationFn: updatePurchaser,
    onSuccess: () => { toast.success("Purchaser updated"); invalidate(); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update purchaser"),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchaser,
    onSuccess: () => { toast.success("Purchaser deactivated"); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to deactivate purchaser"),
  });

  const openCreate = () => { setEditing(null); reset({ name: "", email: "", phone: "", designation: "" }); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); reset(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const onSubmit = (values) => {
    if (editing) updateMutation.mutate({ id: editing._id, ...values });
    else createMutation.mutate(values);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search purchasers..." className="field-input pl-9" />
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add Purchaser
        </button>
      </div>

      <div className="panel overflow-x-auto">
        {isLoading ? (
          <Spinner />
        ) : !purchasers?.length ? (
          <EmptyState icon={Users} title="No purchasers yet" description="Add a purchaser so materials can be mapped to them." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Designation</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchasers.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-5 py-3 text-slate-600">{p.email}</td>
                  <td className="figure px-5 py-3 text-slate-600">{p.phone || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{p.designation || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(p)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-700" aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`Deactivate ${p.name}?`)) deleteMutation.mutate(p._id); }}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Deactivate"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Purchaser" : "Add Purchaser"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="field-label">Name</label>
            <input className="field-input" placeholder="Rajesh Kumar" {...register("name", { required: "Required" })} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="field-label">Email</label>
            <input type="email" className="field-input" placeholder="rajesh@company.com" {...register("email", { required: "Required" })} />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Phone</label>
              <input className="field-input" placeholder="9876500000" {...register("phone")} />
            </div>
            <div>
              <label className="field-label">Designation</label>
              <input className="field-input" placeholder="Senior Purchaser" {...register("designation")} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary">
              {editing ? "Save Changes" : "Add Purchaser"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchasersMaster;
