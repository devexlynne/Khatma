"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

const STATUS_LABEL = {
  approved: "موافق عليه",
  pending: "بانتظار موافقة المشرف",
  rejected: "مرفوض",
};

export default function AdminUserApprovalActions({ userId, status, isAdminAccount }) {
  const router = useRouter();
  const notify = useToast();
  const [loading, setLoading] = useState(false);

  async function update(action) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "تعذر تحديث الحساب");
      notify(action === "approve" ? "تمت الموافقة على الحساب" : "تم رفض الحساب");
      router.refresh();
    } catch (error) {
      notify(error.message || "تعذر تحديث الحساب", "error");
    } finally {
      setLoading(false);
    }
  }

  if (isAdminAccount) {
    return <span className="badge admin-badge">مشرف مفعل</span>;
  }

  return (
    <div className="admin-user-approval">
      <span className={`badge ${status === "approved" ? "completed" : status === "pending" ? "active" : "disabled"}`}>
        {STATUS_LABEL[status] || status || "غير محدد"}
      </span>
      {status !== "approved" ? (
        <button className="btn btn-primary btn-sm" disabled={loading} onClick={() => update("approve")}>
          موافقة
        </button>
      ) : null}
      {status !== "rejected" ? (
        <button className="btn btn-ghost btn-sm" disabled={loading} onClick={() => update("reject")}>
          رفض
        </button>
      ) : null}
    </div>
  );
}
