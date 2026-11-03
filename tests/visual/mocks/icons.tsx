import type { CSSProperties } from "react";
import glyphs from "../../../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json";
type Props = {
  name: keyof typeof glyphs;
  size?: number;
  color?: string;
  accessible?: boolean;
  style?: CSSProperties;
};
export function Ionicons({ name, size = 24, color, style }: Props) {
  return (
    <span
      aria-hidden
      style={{
        fontFamily: "Ionicons",
        fontSize: size,
        color,
        lineHeight: 1,
        display: "inline-block",
        flexShrink: 0,
        ...style,
      }}
    >
      {String.fromCodePoint(glyphs[name] ?? glyphs["help-outline"])}
    </span>
  );
}
Ionicons.glyphMap = glyphs;
export default Ionicons;
