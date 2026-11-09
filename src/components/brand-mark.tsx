import Svg, { Path } from "react-native-svg";
import { useTheme } from "../theme/theme";
export function BrandMark() {
  const c = useTheme();
  return (
    <Svg width={27} height={26} viewBox="0 0 34 30" accessible={false}>
      <Path d="M1 25L12 5L23 25H16L12 17L8 25Z" fill={c.primary} />
      <Path d="M16 25L24 11L33 25H26L24 21L22 25Z" fill={c.lime} />
    </Svg>
  );
}
