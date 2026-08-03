"use client";

export interface RoomValue {
  label: string;
  capacity: number;
  occupied: number;
  priceMonthly?: number;
}

interface Props {
  rooms: RoomValue[];
  onChange: (rooms: RoomValue[]) => void;
}

const cell =
  "w-full min-w-0 rounded-lg border border-neutral-200 px-2.5 py-2 text-sm outline-none focus:border-neutral-400";

// Add, edit, and remove rooms. Vacancy on the public site is derived from these, so
// this is the single most important thing an owner keeps accurate.
export function RoomsEditor({ rooms, onChange }: Props) {
  const update = (index: number, patch: Partial<RoomValue>) =>
    onChange(rooms.map((room, i) => (i === index ? { ...room, ...patch } : room)));

  const add = () => onChange([...rooms, { label: "", capacity: 1, occupied: 0 }]);
  const remove = (index: number) => onChange(rooms.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {rooms.map((room, index) => {
        const available = Math.max(0, room.capacity - room.occupied);
        return (
          <div key={index} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900">Room {index + 1}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove room ${index + 1}`}
                className="rounded-lg px-2 py-1 text-sm text-rose-600 hover:bg-rose-50"
              >
                Remove
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-600">Room name</span>
              <input
                value={room.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="e.g. Room A"
                className={cell}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block min-w-0 space-y-1">
                <span className="text-xs font-medium text-neutral-600">Capacity (beds)</span>
                <input
                  type="number"
                  min={1}
                  value={room.capacity}
                  onChange={(e) => update(index, { capacity: Number(e.target.value) })}
                  className={cell}
                />
              </label>
              <label className="block min-w-0 space-y-1">
                <span className="text-xs font-medium text-neutral-600">Occupied</span>
                <input
                  type="number"
                  min={0}
                  value={room.occupied}
                  onChange={(e) => update(index, { occupied: Number(e.target.value) })}
                  className={cell}
                />
              </label>
            </div>

            <div className="flex items-end justify-between gap-3">
              <label className="block min-w-0 flex-1 space-y-1">
                <span className="text-xs font-medium text-neutral-600">Monthly price (optional)</span>
                <input
                  type="number"
                  min={0}
                  value={room.priceMonthly ?? ""}
                  onChange={(e) =>
                    update(index, { priceMonthly: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="₱ / month"
                  className={cell}
                />
              </label>
              <span
                className={`shrink-0 pb-2 text-xs font-medium ${
                  available > 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {available > 0 ? `${available} available` : "Full"}
              </span>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="text-sm font-medium text-neutral-600 underline hover:text-neutral-900"
      >
        + Add room
      </button>
    </div>
  );
}
