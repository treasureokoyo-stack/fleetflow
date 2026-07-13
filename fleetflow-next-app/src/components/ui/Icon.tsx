import { cn } from "@/lib/utils";

/**
 * Material Symbols Outlined icon wrapper.
 *
 * Renders a ligature-based icon by name. The Material Symbols font is loaded
 * once in the root layout. This keeps markup terse and tree-shakeable.
 */
export type IconProps = {
  name: string;
  className?: string;
  /** Use the "filled" variation (e.g. for status icons). */
  filled?: boolean;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean;
};

export function Icon({
  name,
  className,
  filled = false,
  style,
  ...rest
}: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", filled && "filled", className)}
      style={style}
      aria-hidden={rest["aria-hidden"] ?? true}
    >
      {name}
    </span>
  );
}
