import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
export function LinearGradient({
  children,
  colors,
  style,
  start,
  end,
}: {
  children?: ReactNode;
  colors: string[];
  style?: StyleProp<ViewStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}) {
  const angle =
    start && end
      ? (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI + 90
      : 180;
  return (
    <div
      style={
        {
          display: "flex",
          position: "relative",
          minWidth: 0,
          flexDirection: "column",
          boxSizing: "border-box",
          flexShrink: 0,
          ...StyleSheet.flatten(style),
          backgroundImage: `linear-gradient(${angle}deg,${colors.join(",")})`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
