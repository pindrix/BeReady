import { setCountryCode, completeWelcome } from "../src/state/region";
beforeEach(async () => {
  await setCountryCode("SK");
  await completeWelcome();
});
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
