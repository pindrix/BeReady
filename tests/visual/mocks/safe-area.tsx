import { View, type ViewProps } from "react-native";
export function SafeAreaView({ children, style }: ViewProps) {
  return <View style={style}>{children}</View>;
}
export function SafeAreaProvider({ children }: ViewProps) {
  return <>{children}</>;
}
