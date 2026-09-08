"use client";

import dynamic from "next/dynamic";

// Most users never switch to lender mode, so this whole subtree (KPIs,
// chart, sessions table) is a separate chunk, not part of the initial
// dashboard bundle.
const LenderDashboardContent = dynamic(() => import("@/components/lender/LenderDashboardContent"));

export default function LenderDashboardPage() {
  return <LenderDashboardContent />;
}
