import { setCountryCode, completeWelcome } from "../src/state/region";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
beforeEach(async () => {
  await setCountryCode("SK");
  await completeWelcome();
});
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), setParams: jest.fn() },
  useFocusEffect: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Scene controls are exercised against the software fallback; the native GPU bridge has dedicated tests.
jest.mock("../src/components/gpu-scene", () => ({
  GpuScene: ({ fallback }: { fallback: unknown }) => fallback,
}));
