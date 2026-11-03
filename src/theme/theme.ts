import { useColorScheme } from "react-native";
export function useTheme() {
  const dark = useColorScheme() === "dark";
  return {
    dark,
    navy: dark ? "#E8F1F8" : "#14283B",
    primary: dark ? "#59CFCA" : "#106F6D",
    bg: dark ? "#101C28" : "#F6F8FA",
    card: dark ? "#1B2C3B" : "#FFFFFF",
    text: dark ? "#EDF3F7" : "#182833",
    muted: dark ? "#BACAD5" : "#526674",
    border: dark ? "#3F5363" : "#D8E2E9",
    warning: dark ? "#FFC17A" : "#885016",
    danger: dark ? "#FFB4B4" : "#A52F35",
    tint: dark ? "#203C44" : "#E7F5F3",
  };
}
