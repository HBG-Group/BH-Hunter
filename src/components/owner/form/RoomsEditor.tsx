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

const cell = "rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm outline-none focus:border-neutral-400";

// Add, edit, and remove the rooms of a listing. Vacancy on the public site is derived
// from these, so this is the single most important thing an owner keeps accurate.
export function RoomsEditor({ rooms, onChange }: Props) {
  const update = (index: number, patch: Partial<RoomValue>) =>
    onChange(rooms.map((room, i) => (i === index ? { ...room, ...patch } : room)));

  const add = () => onChange([...rooms, { label: "", capacity: 1, occupied: 0 }]);
  const remove = (index: number) => onChange(rooms.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {rooms.map((room, index) => (
        <div key={index} className="grid grid-cols-[1fr_5rem_5rem_auto] items-center gap-2">
          <input
            value={room.label}
            onChange={(event) => update(index, { label: event.target.value })}
            placeholder="Room name"
            className={cell}
          />
          <input
            type="number"
            min={1}
            value={room.capacity}
            onChange={(event) => update(index, { capacity: Number(event.target.value) })}
            title="Capacity"
            className={cell}
          />
          <input
            type="number"
            min={0}
            value={room.occupied}
            onChange={(event) => update(index, { occupied: Number(event.target.value) })}
            title="Occupied"
            className={cell}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="px-2 text-neutral-400 hover:text-rose-600"
            aria-label="Remove room"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="text-sm text-neutral-600 underline hover:text-neutral-900"
      >
        + Add room
      </button>
    </div>
  );
}
