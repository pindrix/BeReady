import { useColorScheme } from "react-native";
export function useTheme() {
  const dark = useColorScheme() === "dark";
  return {
    dark,
    navy: dark ? "#EDF5F4" : "#132C50",
    primary: dark ? "#9ABEFF" : "#2466D4",
    bg: dark ? "#101B2B" : "#F4F7FC",
    card: dark ? "#19283B" : "#FFFFFF",
    text: dark ? "#F0F5F1" : "#172B49",
    muted: dark ? "#AFBFBC" : "#5C706B",
    border: dark ? "#30445F" : "#DFE7F1",
    warning: dark ? "#FFCD91" : "#84501A",
    danger: dark ? "#FFB8AC" : "#A33434",
    tint: dark ? "#223D61" : "#E8F0FF",
    sage: dark ? "#28493A" : "#DBE8CD",
    peach: dark ? "#523A2D" : "#F8E4CF",
    blue: dark ? "#243F51" : "#DDEBF0",
    purple: dark ? "#3B3552" : "#E8E2F3",
    hero: "#17366A",
    lime: "#B9F4DD",
  };
}
