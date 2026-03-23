// import { useState } from "react";

// ── Icons (inline SVG) ──────────────────────────────────────────────
const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  chart: "M18 20V10 M12 20V4 M6 20v-6",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  search: "M21 21l-4.35-4.35 M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  trend_up: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  trend_dn: "M23 18l-9.5-9.5-5 5L1 6 M17 18h6v-6",
  order:
    "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  revenue: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  dots: "M12 5v.01 M12 12v.01 M12 19v.01",
};

// ── Sparkline SVG ───────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data),
    min = Math.min(...data);
  const w = 80,
    h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Mini Bar Chart ──────────────────────────────────────────────────
function BarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-36 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-xs text-gray-400">{d.value}</span>
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{
              height: `${(d.value / max) * 100}px`,
              backgroundColor: d.color,
            }}
          />
          <span className="text-xs text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Data ────────────────────────────────────────────────────────────
const statCards = [
  {
    label: "Total Revenue",
    value: "$48,295",
    change: "+12.5%",
    up: true,
    spark: [30, 45, 35, 60, 50, 70, 65, 80, 75, 90],
    color: "#111827",
  },
  {
    label: "Active Users",
    value: "3,842",
    change: "+8.1%",
    up: true,
    spark: [20, 35, 30, 50, 45, 60, 55, 70, 65, 80],
    color: "#4B5563",
  },
  {
    label: "New Orders",
    value: "1,257",
    change: "-3.2%",
    up: false,
    spark: [80, 70, 75, 55, 60, 45, 50, 40, 45, 35],
    color: "#6B7280",
  },
  {
    label: "Conversion Rate",
    value: "5.38%",
    change: "+1.8%",
    up: true,
    spark: [25, 30, 28, 40, 38, 50, 48, 55, 52, 62],
    color: "#9CA3AF",
  },
];

const barData = [
  { label: "Jan", value: 42, color: "#E5E7EB" },
  { label: "Feb", value: 58, color: "#E5E7EB" },
  { label: "Mar", value: 51, color: "#E5E7EB" },
  { label: "Apr", value: 73, color: "#111827" },
  { label: "May", value: 66, color: "#E5E7EB" },
  { label: "Jun", value: 89, color: "#E5E7EB" },
  { label: "Jul", value: 78, color: "#E5E7EB" },
];

const tableData = [
  {
    id: "#4821",
    customer: "Siriporn K.",
    product: "Pro Plan",
    amount: "$149",
    status: "Paid",
    date: "24 Mar",
  },
  {
    id: "#4820",
    customer: "Thanakorn W.",
    product: "Starter",
    amount: "$49",
    status: "Pending",
    date: "24 Mar",
  },
  {
    id: "#4819",
    customer: "Nattaya P.",
    product: "Enterprise",
    amount: "$499",
    status: "Paid",
    date: "23 Mar",
  },
  {
    id: "#4818",
    customer: "Wanchai S.",
    product: "Pro Plan",
    amount: "$149",
    status: "Failed",
    date: "23 Mar",
  },
  {
    id: "#4817",
    customer: "Mallika T.",
    product: "Starter",
    amount: "$49",
    status: "Paid",
    date: "22 Mar",
  },
];

const activity = [
  {
    text: "Nattaya upgraded to Enterprise",
    time: "2m ago",
    dot: "bg-gray-900",
  },
  {
    text: "New signup: wanchai@example.com",
    time: "18m ago",
    dot: "bg-gray-400",
  },
  { text: "Payment failed — Order #4818", time: "1h ago", dot: "bg-red-400" },
  { text: "Siriporn renewed Pro Plan", time: "3h ago", dot: "bg-gray-900" },
  { text: "System backup completed", time: "5h ago", dot: "bg-gray-300" },
];


const statusStyle: Record<string, string> = {
  Paid: "bg-gray-100 text-gray-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-red-50 text-red-600",
};

// ── Component ───────────────────────────────────────────────────────
export default function Dashboard() {

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex font-sans">
        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-auto">
          {/* Page title */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Monday, 24 March 2026
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${card.up ? "text-emerald-600" : "text-red-500"}`}
                  >
                    <Icon
                      d={card.up ? icons.trend_up : icons.trend_dn}
                      size={12}
                    />
                    {card.change}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-gray-900">
                    {card.value}
                  </span>
                  <Sparkline data={card.spark} color={card.color} />
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-gray-900">
                  Monthly Revenue
                </h2>
                <span className="text-xs text-gray-400">2026</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Compared to previous year
              </p>
              <BarChart data={barData} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`}
                    />
                    <div>
                      <p className="text-sm text-gray-700 leading-snug">
                        {a.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Recent Orders
              </h2>
              <button className="text-xs text-gray-400 hover:text-gray-900 transition-colors">
                View all →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      "Order",
                      "Customer",
                      "Product",
                      "Amount",
                      "Status",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tableData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-gray-500 text-xs">
                        {row.id}
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 font-medium whitespace-nowrap">
                        {row.customer}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {row.product}
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 font-medium">
                        {row.amount}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusStyle[row.status]}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                        {row.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
