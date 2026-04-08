type BrandWordmarkVariant = "classic" | "glow" | "mono";
type BrandWordmarkFontStyle = "display" | "tech" | "wide";
type BrandWordmarkHeight = "compact" | "default" | "tall";

type Props = {
  className?: string;
  showMark?: boolean;
  variant?: BrandWordmarkVariant;
  fontStyle?: BrandWordmarkFontStyle;
  height?: BrandWordmarkHeight;
};

const palettes: Record<BrandWordmarkVariant, { primary: string; orange: string; glow?: string }> = {
  classic: {
    primary: "#FFFFFF",
    orange: "#F37021",
  },
  glow: {
    primary: "#FFFFFF",
    orange: "#FF9D5C",
    glow: "drop-shadow(0 0 12px rgba(80, 156, 255, 0.45))",
  },
  mono: {
    primary: "#FFFFFF",
    orange: "#F37021",
  },
};

const fontClasses: Record<BrandWordmarkFontStyle, string> = {
  display: "font-display font-extrabold tracking-tight",
  tech: "font-tech font-bold tracking-[0.06em]",
  wide: "font-display font-bold tracking-[0.12em]",
};

const lineHeightClasses: Record<BrandWordmarkHeight, string> = {
  compact: "leading-none",
  default: "leading-[1.02]",
  tall: "leading-[1.18]",
};

const letterSpacingByStyle: Record<BrandWordmarkFontStyle, string> = {
  display: "-0.02em",
  tech: "0.04em",
  wide: "0.08em",
};

export default function BrandWordmark({
  className = "",
  showMark = false,
  variant = "classic",
  fontStyle = "display",
  height = "default",
}: Props) {
  const { primary, orange, glow } = palettes[variant];

  return (
    <span
      className={`inline-flex items-baseline uppercase ${fontClasses[fontStyle]} ${lineHeightClasses[height]} ${className}`}
      style={{ letterSpacing: letterSpacingByStyle[fontStyle], filter: glow }}
      aria-label="REDOXY"
    >
      <span style={{ color: primary }}>RED</span>
      <span style={{ color: orange }}>O</span>
      <span style={{ color: primary }}>XY</span>
      {showMark ? (
        <span className="ml-1 text-[0.55em] align-top" style={{ color: primary }}>
          ®
        </span>
      ) : null}
    </span>
  );
}
