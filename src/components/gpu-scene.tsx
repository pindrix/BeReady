import { useFocusEffect } from "expo-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { graphicsDocument } from "../simulation/graphics-document";
import {
  graphicsEvent,
  type GraphicsFrame,
} from "../simulation/graphics-protocol";
export type GpuSceneProps = { data: GraphicsFrame; fallback: ReactNode };
const source = { html: graphicsDocument };
export function GpuScene({ data, fallback }: GpuSceneProps) {
  const ref = useRef<WebView<unknown>>(null),
    [ready, setReady] = useState(false),
    [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false),
    [active, setActive] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setActive(true);
      return () => {
        setReady(false);
        setLoaded(false);
        setActive(false);
      };
    }, []),
  );
  const fail = useCallback(() => setFailed(true), []);
  useEffect(() => {
    if (failed || loaded || !active) return;
    const timeout = setTimeout(fail, 8000);
    return () => clearTimeout(timeout);
  }, [fail, failed, loaded, active]);
  useEffect(() => {
    if (active && ready && !failed)
      ref.current?.postMessage(JSON.stringify(data));
  }, [data, ready, failed, active]);
  if (failed || !active) return fallback;
  return (
    <View style={{ flex: 1 }}>
      <WebView<unknown>
        ref={ref}
        testID="gpu-3d"
        source={source}
        originWhitelist={["*"]}
        onShouldStartLoadWithRequest={(request) =>
          request.url === "about:blank"
        }
        onMessage={(event) => {
          const status = graphicsEvent(event.nativeEvent.data);
          if (status === "ready") setReady(true);
          if (status === "rendered") setLoaded(true);
          if (status === "error") fail();
        }}
        onError={fail}
        onRenderProcessGone={fail}
        onContentProcessDidTerminate={fail}
        javaScriptEnabled
        domStorageEnabled={false}
        thirdPartyCookiesEnabled={false}
        sharedCookiesEnabled={false}
        allowFileAccess={false}
        setSupportMultipleWindows={false}
        scrollEnabled={false}
        bounces={false}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "transparent",
        }}
      />
      {!loaded ? (
        <View
          testID="gpu-placeholder"
          pointerEvents="none"
          style={{ position: "absolute", inset: 0 }}
        >
          {fallback}
        </View>
      ) : null}
    </View>
  );
}
