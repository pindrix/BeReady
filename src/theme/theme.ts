import { useColorScheme } from "react-native";
export function useTheme() {
  const dark = useColorScheme() === "dark";
  return {
    dark,
    navy: dark ? "#EDF5F4" : "#172F32",
    primary: dark ? "#91D6BF" : "#246B55",
    bg: dark ? "#101D20" : "#F6F7F2",
    card: dark ? "#1B2D30" : "#FFFFFF",
    text: dark ? "#F0F5F1" : "#1A302F",
    muted: dark ? "#AFBFBC" : "#5C706B",
    border: dark ? "#344B4B" : "#E1E8DF",
    warning: dark ? "#FFCD91" : "#84501A",
    danger: dark ? "#FFB8AC" : "#A33434",
    tint: dark ? "#24463C" : "#EAF1E7",
    sage: dark ? "#28493A" : "#DBE8CD",
    peach: dark ? "#523A2D" : "#F8E4CF",
    blue: dark ? "#243F51" : "#DDEBF0",
    purple: dark ? "#3B3552" : "#E8E2F3",
    hero: "#193C36",
    lime: "#D1EB9A",
  };
}
