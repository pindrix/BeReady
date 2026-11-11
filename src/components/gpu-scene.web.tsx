/** Same offline WebGL document used by native WebView, hosted in an isolated iframe for browser QA. */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { graphicsDocument } from "../simulation/graphics-document";
import {
  graphicsEvent,
  type GraphicsFrame,
} from "../simulation/graphics-protocol";
export type GpuSceneProps = { data: GraphicsFrame; fallback: ReactNode };
export function GpuScene({ data, fallback }: GpuSceneProps) {
  const ref = useRef<HTMLIFrameElement>(null),
    [ready, setReady] = useState(false),
    [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== ref.current?.contentWindow) return;
      const status =
        typeof event.data === "string" ? graphicsEvent(event.data) : null;
      if (status === "ready") setReady(true);
      if (status === "rendered") setLoaded(true);
      if (status === "error") fail();
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [fail]);
  useEffect(() => {
    if (ready && !failed)
      ref.current?.contentWindow?.postMessage(JSON.stringify(data), "*");
  }, [data, ready, failed]);
  useEffect(() => {
    if (failed || loaded) return;
    const timeout = setTimeout(fail, 8000);
    return () => clearTimeout(timeout);
  }, [fail, failed, loaded]);
  if (failed) return fallback;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {!loaded ? fallback : null}
      <iframe
        ref={ref}
        title="3D"
        data-testid="gpu-3d"
        data-ready={loaded}
        srcDoc={graphicsDocument}
        sandbox="allow-scripts"
        onError={fail}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          opacity: loaded ? 1 : 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
