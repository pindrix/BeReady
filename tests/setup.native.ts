import { setCountryCode, completeWelcome } from "../src/state/region";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
beforeEach(async () => {
  await setCountryCode("SK");
  await completeWelcome();
});
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useFocusEffect: jest.fn(),
  useLocalSearchParams: () => ({}),
}));
