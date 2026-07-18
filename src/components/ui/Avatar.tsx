import Image from "next/image";

interface Props {
  name: string;
  src?: string | null;
  size?: number;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Profile photo, falling back to the user's initials when there's no image.
export function Avatar({ name, src, size = 32 }: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <span
      className="flex items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white"
      style={{ width: size, height: size }}
    >
      {initials(name) || "U"}
    </span>
  );
}
