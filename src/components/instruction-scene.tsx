import { memo, useState } from "react";
import { Animated, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Glyph } from "./tutorial-scene";
import type { DiagramStep } from "../data/instruction-scenes";
/** Each layer has a fixed 320x200 canvas, scaled together on narrow devices. */
export const InstructionScene = memo(function InstructionScene({
  spec,
  progress,
}: {
  spec: DiagramStep;
  progress: Animated.Value;
}) {
  const [width, setWidth] = useState(320),
    height = (width * 200) / 320;
  const move = spec.mode === "move",
    avoid = spec.mode === "avoid",
    inspect = spec.mode === "inspect",
    shelter = spec.mode === "shelter",
    hazardRetreat = avoid && spec.left === "house";
  const tx = progress.interpolate({
    inputRange: [0, 1],
    outputRange: avoid
      ? hazardRetreat
        ? [0, 0]
        : [20, -12]
      : move
        ? [0, 160]
        : shelter
          ? [0, 160]
          : [0, 0],
  });
  return (
    <View
      testID="instruction-scene"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - width) > 0.5) setWidth(w);
      }}
      style={{
        width: "100%",
        aspectRatio: 320 / 200,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "#E5EDF4",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: 320,
          height: 200,
          left: (width - 320) / 2,
          top: (height - 200) / 2,
          transform: [{ scale: width / 320 }],
        }}
      >
        <Svg width={320} height={200} viewBox="0 0 320 200" accessible={false}>
          <Circle cx={280} cy={20} r={72} fill="#FFFDF4" opacity={0.65} />
          <Circle cx={30} cy={196} r={65} fill="#BEDDCE" opacity={0.35} />
          <Path
            d="M18 178Q155 163 302 178"
            stroke="#234B61"
            strokeWidth={2}
            fill="none"
            opacity={0.18}
          />
          {move || shelter ? (
            <Path
              d="M114 127H171M159 117L173 127L159 137"
              stroke="#577F9A"
              strokeWidth={3}
              fill="none"
            />
          ) : null}
          {avoid ? (
            <Path
              d="M100 166H31M43 156L29 166L43 176"
              stroke="#577F9A"
              strokeWidth={4}
              fill="none"
            />
          ) : null}
          {shelter ? (
            <Rect
              x={177}
              y={82}
              width={109}
              height={93}
              rx={14}
              fill="#C4DDCB"
            />
          ) : null}
        </Svg>
        {move || shelter ? (
          <View
            style={{ position: "absolute", left: 37, top: 89, opacity: 0.2 }}
          >
            <Glyph name={spec.left} size={74} />
          </View>
        ) : null}
        <Animated.View
          style={{
            position: "absolute",
            left: 192,
            top: 74,
            transform: [
              {
                translateX: hazardRetreat
                  ? progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-12, 12],
                    })
                  : 0,
              },
            ],
          }}
        >
          <Glyph name={spec.right} size={90} />
        </Animated.View>
        <Animated.View
          style={{
            position: "absolute",
            left: 37,
            top: 89,
            transform: [
              { translateX: tx },
              {
                scale: move
                  ? progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.68],
                    })
                  : 1,
              },
            ],
            opacity: move
              ? progress.interpolate({
                  inputRange: [0, 0.75, 1],
                  outputRange: [1, 1, 0.7],
                })
              : 1,
          }}
        >
          <Glyph name={spec.left} size={74} />
        </Animated.View>
        {spec.detail ? (
          <View style={{ position: "absolute", left: 127, top: 18 }}>
            <Glyph name={spec.detail} size={51} />
          </View>
        ) : null}
        {avoid ? (
          <View style={{ position: "absolute", left: 188, top: 71 }}>
            <Svg
              width={100}
              height={100}
              viewBox="0 0 100 100"
              accessible={false}
            >
              <Circle
                cx={50}
                cy={50}
                r={43}
                stroke="#A6544E"
                strokeWidth={4}
                fill="none"
              />
              <Path d="M20 20L80 80" stroke="#A6544E" strokeWidth={5} />
            </Svg>
          </View>
        ) : null}
        {inspect ? (
          <Animated.View
            style={{
              position: "absolute",
              left: 189,
              top: 69,
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 12],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [5, -5],
                  }),
                },
              ],
            }}
          >
            <Svg width={92} height={92} viewBox="0 0 92 92" accessible={false}>
              <Circle
                cx={39}
                cy={36}
                r={25}
                stroke="#234B61"
                strokeWidth={4}
                fill="#FFFFFF"
                fillOpacity={0.2}
              />
              <Path
                d="M57 55L79 77"
                stroke="#234B61"
                strokeWidth={7}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>
        ) : null}
        {spec.mode === "compare" ? (
          <Animated.View
            style={{
              position: "absolute",
              left: 39,
              top: 169,
              width: 245,
              height: 5,
              borderRadius: 4,
              backgroundColor: "#537EAF",
              transformOrigin: [0, "50%", 0],
              transform: [
                {
                  scaleX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.15, 1],
                  }),
                },
              ],
            }}
          />
        ) : null}
      </View>
    </View>
  );
});
