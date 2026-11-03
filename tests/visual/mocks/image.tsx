import { StyleSheet, type ImageStyle, type StyleProp } from "react-native";
export function Image({
  source,
  style,
  contentFit,
  accessibilityLabel,
}: {
  source: string | { uri: string };
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain";
  accessibilityLabel?: string;
}) {
  const resolved = typeof source === "string" ? source : source.uri;
  return (
    <img
      src={resolved}
      alt={accessibilityLabel ?? ""}
      style={
        {
          ...StyleSheet.flatten(style),
          objectFit: contentFit ?? "cover",
        } as React.CSSProperties
      }
    />
  );
}
