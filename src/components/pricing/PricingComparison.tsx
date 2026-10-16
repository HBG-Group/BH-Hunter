import { PLANS, type Plan } from "@/config/pricing";

// A yes/no or value cell for the comparison grid.
function Cell({ children }: { children: React.ReactNode }) {
  return <td className="border-t border-line px-4 py-3 text-center text-sm text-ink">{children}</td>;
}

function Bool({ value }: { value: boolean }) {
  return value ? (
    <span className="text-emerald-600" aria-label="Included">
      ✓
    </span>
  ) : (
    <span className="text-neutral-300" aria-label="Not included">
      —
    </span>
  );
}

const rows: { label: string; render: (plan: Plan) => React.ReactNode }[] = [
  { label: "Listings included", render: (p) => p.freeListings },
  { label: "Rooms per listing", render: (p) => p.roomsPerListing },
  { label: "Verified Badge", render: (p) => <Bool value={p.verifiedBadge} /> },
  { label: "Featured Listing", render: (p) => <Bool value={p.featuredListing} /> },
  { label: "Student inquiries", render: () => <Bool value /> },
  { label: "Dashboard", render: () => <Bool value /> },
  { label: "Additional listing cost", render: (p) => `₱${p.extraListingPrice}` },
];

// A scan-friendly plan comparison. Scrolls horizontally on small screens.
export function PricingComparison() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
              Feature
            </th>
            {PLANS.map((plan) => (
              <th key={plan.id} className="px-4 py-3 text-center text-sm font-semibold text-ink">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th className="border-t border-line px-4 py-3 text-left text-sm font-medium text-muted">
                {row.label}
              </th>
              {PLANS.map((plan) => (
                <Cell key={plan.id}>{row.render(plan)}</Cell>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
