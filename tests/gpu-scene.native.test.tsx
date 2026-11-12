import { useFocusEffect } from "expo-router";
/* eslint-disable @typescript-eslint/no-require-imports -- Native WebView adapter is explicitly mocked. */
import { act, render, screen, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { GpuScene } from "../src/components/gpu-scene";
import { graphicsFrame } from "../src/simulation/graphics-protocol";
jest.unmock("../src/components/gpu-scene");
const mockPost = jest.fn();
jest.mock("react-native-webview", () => {
  const React = require("react"),
    { View } = require("react-native");
  return {
    WebView: React.forwardRef(function MockWebView(
      props: unknown,
      ref: unknown,
    ) {
      React.useImperativeHandle(ref, () => ({ postMessage: mockPost }));
      return React.createElement(View, {
        ...(props as object),
        testID: "mock-webview",
      });
    }),
  };
});
const data = graphicsFrame(
  { id: "go-bag", kind: "bag", step: 0 },
  0,
  0.62,
  1,
  "aurora",
);
beforeEach(() => mockPost.mockClear());
afterEach(() => jest.useRealTimers());
test("offline GPU bridge sends only state after readiness and refuses external navigation", async () => {
  const result = await render(
      <GpuScene data={data} fallback={<Text>fallback</Text>} />,
    ),
    view = screen.getByTestId("mock-webview");
  expect(mockPost).not.toHaveBeenCalled();
  expect(view.props.source.html).toContain("connect-src blob:");
  expect(view.props.onShouldStartLoadWithRequest({ url: "about:blank" })).toBe(
    true,
  );
  for (const url of [
    "https://example.com",
    "file:///tmp/test",
    "javascript:alert(1)",
  ])
    expect(view.props.onShouldStartLoadWithRequest({ url })).toBe(false);
  await fireEvent(view, "message", {
    nativeEvent: {
      data: JSON.stringify({ channel: "be-ready-graphics", type: "ready" }),
    },
  });
  expect(JSON.parse(mockPost.mock.lastCall![0])).toEqual(data);
  expect(screen.getByTestId("gpu-placeholder")).toBeTruthy();
  await fireEvent(screen.getByTestId("mock-webview"), "message", {
    nativeEvent: {
      data: JSON.stringify({ channel: "be-ready-graphics", type: "rendered" }),
    },
  });
  expect(screen.queryByTestId("gpu-placeholder")).toBeNull();
  const next = { ...data, frame: 0.5 };
  await result.rerender(
    <GpuScene data={next} fallback={<Text>fallback</Text>} />,
  );
  expect(JSON.parse(mockPost.mock.lastCall![0])).toEqual(next);
  await fireEvent(screen.getByTestId("mock-webview"), "error");
  expect(screen.queryByTestId("mock-webview")).toBeNull();
  expect(screen.getByText("fallback")).toBeTruthy();
});
test("missing GPU readiness times out to the local fallback and unmount clears the timeout", async () => {
  jest.useFakeTimers();
  const result = await render(
    <GpuScene data={data} fallback={<Text>fallback</Text>} />,
  );
  await act(async () => jest.advanceTimersByTime(8001));
  expect(screen.queryByTestId("mock-webview")).toBeNull();
  await result.unmount();
  const scheduled = jest.spyOn(global, "setTimeout"),
    cleared = jest.spyOn(global, "clearTimeout");
  const next = await render(
    <GpuScene data={data} fallback={<Text>fallback</Text>} />,
  );
  const index = scheduled.mock.calls.findIndex((call) => call[1] === 8000),
    handle = scheduled.mock.results[index].value;
  await next.unmount();
  expect(cleared).toHaveBeenCalledWith(handle);
  scheduled.mockRestore();
  cleared.mockRestore();
});

test("leaving a native screen releases its WebView and returning waits for a new context", async () => {
  await render(<GpuScene data={data} fallback={<Text>fallback</Text>} />);
  await fireEvent(screen.getByTestId("mock-webview"), "message", {
    nativeEvent: {
      data: JSON.stringify({ channel: "be-ready-graphics", type: "ready" }),
    },
  });
  const focus = jest.mocked(useFocusEffect).mock.calls.at(-1)![0];
  let blur: ReturnType<typeof focus>;
  await act(async () => {
    blur = focus();
  });
  await act(async () => {
    if (typeof blur === "function") blur();
  });
  expect(screen.queryByTestId("mock-webview")).toBeNull();
  await act(async () => {
    focus();
  });
  expect(screen.getByTestId("gpu-placeholder")).toBeTruthy();
});
