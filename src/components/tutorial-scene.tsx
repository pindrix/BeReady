import { type ReactNode, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { useTheme } from "../theme/theme";

export type TutorialSceneKind = "bag" | "water" | "power" | "communication";

type Props = {
  kind: TutorialSceneKind;
  step: number;
  /** Controlled by the player, including pause and reduced-motion behaviour. */
  progress: Animated.Value;
};
export type GlyphName =
  | "bag"
  | "bottle"
  | "documents"
  | "medicine"
  | "food"
  | "torch"
  | "radio"
  | "battery"
  | "shirt"
  | "hygiene"
  | "person"
  | "contact"
  | "phone"
  | "pin"
  | "calendar"
  | "jug"
  | "fridge"
  | "generator"
  | "house"
  | "candle"
  | "guidance"
  | "chemical"
  | "plan"
  | "crouch"
  | "flame"
  | "waves"
  | "storm"
  | "sun"
  | "snow"
  | "pet"
  | "lock"
  | "storage"
  | "clock"
  | "map"
  | "door"
  | "calculator";

const INK = "#23463E";
const PAPER = "#FFF9EB";
const GREEN = "#6C997A";
const WATER = "#9BD4E7";
const ORANGE = "#E5AF76";
const RED = "#AB433C";

function useScenePalette() {
  const c = useTheme();
  // A muted light drawing surface keeps dark object outlines legible in both themes.
  return c.dark
    ? {
        ...c,
        text: INK,
        muted: "#4F6960",
        card: "#E4E8DB",
        sage: "#B9CDB2",
        blue: "#B9D1D9",
        peach: "#D6C0AC",
        purple: "#C8BED9",
      }
    : c;
}

/** All art is bundled SVG. Animated native wrappers keep it usable offline. */
export function Glyph({ name, size = 80 }: { name: GlyphName; size?: number }) {
  let drawing: ReactNode;
  switch (name) {
    case "bag":
      drawing = (
        <>
          <Path d="M27 21v-5q0-8 13-8t13 8v5" fill="none" strokeWidth={5} />
          <Rect x={12} y={27} width={9} height={42} rx={4} fill={INK} />
          <Rect x={59} y={27} width={9} height={42} rx={4} fill={INK} />
          <Rect x={19} y={19} width={42} height={56} rx={13} fill={GREEN} />
          <Path d="M22 23h36v18q-18 9-36 0z" fill={PAPER} />
          <Rect x={28} y={51} width={24} height={17} rx={5} fill="#D8E6B9" />
          <Path d="M34 42v7m12-7v7" strokeWidth={3} />
        </>
      );
      break;
    case "bottle":
      drawing = (
        <>
          <Path
            d="M30 17v13l-8 12v27q0 6 6 6h24q6 0 6-6V42l-8-12V17"
            fill={PAPER}
          />
          <Path
            d="M24 47h32v21q0 5-5 5H29q-5 0-5-5z"
            fill={WATER}
            stroke="none"
          />
          <Rect x={28} y={10} width={24} height={11} rx={3} fill={GREEN} />
          <Path d="M29 25h22M29 55h22M29 62h22" opacity={0.35} />
          <Rect x={27} y={39} width={26} height={15} rx={3} fill={PAPER} />
          <Path d="M40 41q-9 10 0 10t0-10" fill={WATER} strokeWidth={1.5} />
        </>
      );
      break;
    case "documents":
      drawing = (
        <>
          <Rect
            x={15}
            y={17}
            width={46}
            height={55}
            rx={5}
            fill={GREEN}
            transform="rotate(-8 38 44)"
          />
          <Rect x={21} y={9} width={45} height={56} rx={5} fill={PAPER} />
          <Circle cx={36} cy={29} r={7} fill={ORANGE} />
          <Path d="M27 43q9-12 18 0M49 24h9m-9 8h9M29 52h27M29 58h18" />
        </>
      );
      break;
    case "medicine":
      drawing = (
        <>
          <Rect x={24} y={21} width={32} height={51} rx={8} fill={PAPER} />
          <Rect x={21} y={10} width={38} height={16} rx={4} fill={GREEN} />
          <Rect x={24} y={36} width={32} height={25} fill="#E9D7B7" />
          <Path d="M40 41v15m-7-7h14" stroke={RED} strokeWidth={4} />
        </>
      );
      break;
    case "food":
      drawing = (
        <>
          <Rect x={13} y={19} width={34} height={51} rx={5} fill={PAPER} />
          <Ellipse cx={30} cy={20} rx={17} ry={6} fill={ORANGE} />
          <Path d="M17 38h26v18H17z" fill={GREEN} />
          <Path d="M52 27h18l3 40H50z" fill={ORANGE} />
          <Path d="M54 35h14m-13 22h12M27 44l6 6m-6 0 6-6" stroke={PAPER} />
        </>
      );
      break;
    case "torch":
      drawing = (
        <>
          <Path d="M31 32h18v39H31z" fill={GREEN} />
          <Path d="M21 14h38l-8 21H29z" fill={ORANGE} />
          <Rect x={21} y={9} width={38} height={9} rx={3} fill={PAPER} />
          <Rect x={36} y={44} width={8} height={13} rx={3} fill={PAPER} />
        </>
      );
      break;
    case "radio":
      drawing = (
        <>
          <Path d="m53 23 14-17M24 27v-8h25v8" fill="none" strokeWidth={3} />
          <Rect x={9} y={27} width={62} height={43} rx={8} fill={GREEN} />
          <Circle cx={30} cy={49} r={14} fill={PAPER} />
          <Path d="M23 40v18m7-21v24m7-21v18" opacity={0.4} />
          <Rect x={50} y={36} width={14} height={9} rx={2} fill={PAPER} />
          <Circle cx={57} cy={57} r={5} fill={ORANGE} />
        </>
      );
      break;
    case "battery":
      drawing = (
        <>
          <Rect x={20} y={16} width={40} height={58} rx={9} fill={PAPER} />
          <Path d="M32 16V8h16v8" fill={GREEN} />
          <Rect
            x={27}
            y={48}
            width={26}
            height={18}
            rx={3}
            fill={GREEN}
            stroke="none"
          />
          <Path d="m43 25-9 13h10l-6 11" fill="none" strokeWidth={3} />
        </>
      );
      break;
    case "shirt":
      drawing = (
        <>
          <Path
            d="M24 14 9 28l10 16 9-6v33h27V38l8 6 10-16-17-14-8 8H33z"
            fill={ORANGE}
          />
          <Path d="M33 16q7 15 16 0M28 52h27" fill="none" />
        </>
      );
      break;
    case "hygiene":
      drawing = (
        <>
          <Rect x={11} y={37} width={43} height={34} rx={10} fill={PAPER} />
          <Path d="M24 38V24h17v14M27 24V14h25" fill="none" strokeWidth={4} />
          <Path d="M32 47q-12 14 0 14t0-14" fill={WATER} />
          <Path d="M62 69V27" strokeWidth={6} />
          <Rect x={57} y={9} width={11} height={22} rx={3} fill={GREEN} />
          <Path d="M58 14h9m-9 6h9" stroke={PAPER} />
        </>
      );
      break;
    case "person":
      drawing = (
        <>
          <Circle cx={40} cy={16} r={10} fill={ORANGE} />
          <Path d="M28 37q0-9 12-9t12 9v20H28z" fill={GREEN} />
          <Path
            d="m29 36-9 18m31-18 9 18M33 57l-5 17m19-17 5 17"
            fill="none"
            strokeWidth={6}
          />
        </>
      );
      break;
    case "contact":
      drawing = (
        <>
          <Rect x={7} y={15} width={66} height={51} rx={7} fill={PAPER} />
          <Circle cx={28} cy={33} r={8} fill={ORANGE} />
          <Path d="M15 54q0-13 13-13t13 13z" fill={GREEN} />
          <Path d="M48 30h16m-16 9h13m-13 9h16M17 60h46" />
        </>
      );
      break;
    case "phone":
      drawing = (
        <>
          <Rect x={19} y={5} width={43} height={71} rx={9} fill={INK} />
          <Rect x={23} y={15} width={35} height={49} rx={3} fill={WATER} />
          <Path d="M34 10h13" stroke={PAPER} />
          <Circle cx={40} cy={70} r={2} fill={PAPER} stroke="none" />
        </>
      );
      break;
    case "pin":
      drawing = (
        <>
          <Path
            d="M40 73S15 47 15 29a25 25 0 0 1 50 0c0 18-25 44-25 44z"
            fill={ORANGE}
          />
          <Circle cx={40} cy={29} r={11} fill={PAPER} />
          <Path d="m35 29 4 4 7-8" fill="none" strokeWidth={3} />
        </>
      );
      break;
    case "calendar":
      drawing = (
        <>
          <Rect x={12} y={17} width={57} height={54} rx={7} fill={PAPER} />
          <Path d="M12 33h57M26 10v16m29-16v16" strokeWidth={4} />
          <Path
            d="m27 49 9 9 17-19"
            stroke={GREEN}
            strokeWidth={5}
            fill="none"
          />
        </>
      );
      break;
    case "jug":
      drawing = (
        <>
          <Path
            d="M29 18h24v10l12 11v29q0 7-7 7H22q-7 0-7-7V38l14-10z"
            fill={PAPER}
          />
          <Path
            d="M21 48h38v20q0 2-3 2H24q-3 0-3-2z"
            fill={WATER}
            stroke="none"
          />
          <Path d="M51 29h8q10 0 10 11v9H59" fill="none" strokeWidth={4} />
          <Rect x={25} y={42} width={27} height={20} rx={3} fill={PAPER} />
          <Path
            d="M31 47v10m-3-10v4h6v-4m12 0v10m0-10q-6 3 0 6"
            strokeWidth={1.8}
            fill="none"
          />
        </>
      );
      break;
    case "fridge":
      drawing = (
        <>
          <Rect x={15} y={6} width={51} height={69} rx={7} fill={GREEN} />
          <Rect x={20} y={12} width={40} height={57} rx={3} fill={PAPER} />
          <Path d="M20 33h40M20 50h40" />
          <Rect x={25} y={37} width={11} height={12} rx={2} fill={WATER} />
          <Path d="M43 40h11v9H43z" fill={ORANGE} />
          <Path d="M24 75v3m34-3v3" strokeWidth={4} />
        </>
      );
      break;
    case "generator":
      drawing = (
        <>
          <Rect x={8} y={25} width={65} height={41} rx={8} fill={INK} />
          <Rect x={14} y={29} width={53} height={31} rx={4} fill={ORANGE} />
          <Path d="M25 25v-9h28v9M73 39h5" fill="none" strokeWidth={5} />
          <Circle cx={32} cy={45} r={10} fill={PAPER} />
          <Path d="m34 38-6 9h7l-4 7" fill="none" />
          <Path d="M51 37v17m5-17v17" />
          <Circle cx={21} cy={68} r={5} fill={INK} />
          <Circle cx={62} cy={68} r={5} fill={INK} />
        </>
      );
      break;
    case "house":
      drawing = (
        <>
          <Path d="M13 34h54v41H13z" fill={PAPER} />
          <Path d="M6 35 40 7l34 28z" fill={GREEN} />
          <Rect x={34} y={46} width={16} height={29} rx={2} fill={ORANGE} />
          <Rect x={19} y={43} width={11} height={12} rx={2} fill={WATER} />
          <Rect x={54} y={43} width={8} height={12} rx={2} fill={WATER} />
        </>
      );
      break;
    case "candle":
      drawing = (
        <>
          <Path d="M16 71h48" strokeWidth={4} />
          <Rect x={28} y={34} width={25} height={35} rx={3} fill={PAPER} />
          <Path d="M40 33v-8m0-20q-15 19 0 21t0-21" fill={ORANGE} />
        </>
      );
      break;
    case "guidance":
      drawing = (
        <>
          <Rect x={10} y={8} width={60} height={66} rx={7} fill={PAPER} />
          <Path
            d="m22 29 18-12 18 12zM26 31v13m14-13v13m14-13v13M22 46h36"
            fill={GREEN}
          />
          <Path d="M23 56h34m-34 8h23" />
        </>
      );
      break;
    case "chemical":
      drawing = (
        <>
          <Path d="M30 24h24l10 12v37H17V35z" fill={ORANGE} />
          <Path d="M29 24V12h25v12M53 34h8v14h-8z" fill={PAPER} />
          <Path d="m40 41 13 13-13 13-13-13z" fill={PAPER} />
          <Path d="M40 46v10m0 5v1" strokeWidth={3} />
        </>
      );
      break;
    case "crouch":
      drawing = (
        <>
          <Circle cx={53} cy={36} r={10} fill="#E8BD99" />
          <Path d="M43 42L24 54L19 66H48L37 59L57 52L65 64" fill={GREEN} />
          <Path d="M23 69H55M59 48L65 62" strokeWidth={4} fill="none" />
        </>
      );
      break;
    case "flame":
      drawing = (
        <>
          <Path
            d="M40 5Q48 30 59 38Q76 62 53 73Q32 85 17 66Q5 49 28 31Q23 48 35 45Q48 35 40 5Z"
            fill={ORANGE}
          />
          <Path d="M42 44Q60 64 43 73Q23 70 34 55Z" fill={PAPER} />
        </>
      );
      break;
    case "waves":
      drawing = (
        <>
          <Path
            d="M4 28Q14 15 26 28T49 28T75 28M4 46Q14 33 26 46T49 46T75 46M4 64Q14 51 26 64T49 64T75 64"
            fill="none"
            stroke={WATER}
            strokeWidth={7}
          />
        </>
      );
      break;
    case "storm":
      drawing = (
        <>
          <Path
            d="M15 42Q2 27 18 22Q26 2 43 15Q64 9 68 28Q80 42 63 47H17Z"
            fill={WATER}
          />
          <Path d="M42 43L28 61H42L34 76L57 53H44L50 43" fill={ORANGE} />
        </>
      );
      break;
    case "sun":
      drawing = (
        <>
          <Circle cx={40} cy={40} r={18} fill={ORANGE} />
          <Path
            d="M40 4V14M40 66V76M4 40H14M66 40H76M14 14L22 22M58 58L66 66M14 66L22 58M58 22L66 14"
            strokeWidth={4}
          />
        </>
      );
      break;
    case "snow":
      drawing = (
        <>
          <Path
            d="M40 7V73M11 23L69 57M11 57L69 23M29 12L40 23L51 12M29 68L40 57L51 68M11 36L26 32L22 17M58 63L54 48L69 44M11 44L26 48L22 63M58 17L54 32L69 36"
            fill="none"
            stroke={WATER}
            strokeWidth={3}
          />
        </>
      );
      break;
    case "pet":
      drawing = (
        <>
          <Rect x={8} y={28} width={65} height={45} rx={9} fill={GREEN} />
          <Path d="M25 28V18Q40 7 55 18V28" fill="none" strokeWidth={4} />
          <Rect x={17} y={36} width={45} height={29} rx={6} fill={PAPER} />
          <Circle cx={40} cy={48} r={7} fill={ORANGE} />
          <Path
            d="M33 44L32 37L38 42M44 42L49 37L48 45M23 38V64M56 38V64"
            fill="none"
          />
        </>
      );
      break;
    case "lock":
      drawing = (
        <>
          <Path d="M22 35V24Q40-3 58 24V35" fill="none" strokeWidth={5} />
          <Rect x={14} y={33} width={52} height={40} rx={8} fill={GREEN} />
          <Circle cx={40} cy={49} r={5} fill={PAPER} />
          <Path d="M40 54V62" strokeWidth={4} />
        </>
      );
      break;
    case "storage":
      drawing = (
        <>
          <Rect x={13} y={14} width={54} height={59} rx={8} fill={WATER} />
          <Path d="M14 31H66M14 49H66" />
          <Circle cx={57} cy={23} r={3} fill={GREEN} />
          <Circle cx={57} cy={40} r={3} fill={GREEN} />
          <Circle cx={57} cy={59} r={3} fill={GREEN} />
          <Path d="M24 23H43M24 41H43M24 60H43" />
        </>
      );
      break;
    case "clock":
      drawing = (
        <>
          <Circle cx={40} cy={42} r={29} fill={PAPER} />
          <Path
            d="M40 24V43L55 52M25 5H55M40 5V13"
            fill="none"
            strokeWidth={4}
          />
        </>
      );
      break;
    case "map":
      drawing = (
        <>
          <Path d="M5 18L27 9L53 20L75 10V65L53 75L27 63L5 73Z" fill={PAPER} />
          <Path d="M27 9V63M53 20V75" stroke={GREEN} />
          <Path
            d="M16 49L34 33L47 47L65 30"
            fill="none"
            stroke={ORANGE}
            strokeWidth={4}
          />
          <Circle cx={65} cy={30} r={5} fill={GREEN} />
        </>
      );
      break;
    case "door":
      drawing = (
        <>
          <Rect x={14} y={7} width={51} height={66} rx={4} fill={GREEN} />
          <Rect x={22} y={15} width={35} height={58} rx={3} fill={PAPER} />
          <Circle cx={48} cy={44} r={3} fill={INK} />
          <Path d="M5 74H75" strokeWidth={4} />
        </>
      );
      break;
    case "calculator":
      drawing = (
        <>
          <Rect x={17} y={6} width={46} height={68} rx={7} fill={GREEN} />
          <Rect x={24} y={14} width={32} height={15} rx={3} fill={PAPER} />
          <Path
            d="M26 41H31M26 52H31M26 63H31M39 41H44M39 52H44M39 63H44M51 41H55M51 52H55M51 63H55"
            stroke={PAPER}
            strokeWidth={4}
          />
        </>
      );
      break;
    case "plan":
      drawing = (
        <>
          <Rect x={14} y={12} width={51} height={63} rx={6} fill={PAPER} />
          <Rect x={28} y={7} width={24} height={11} rx={4} fill={GREEN} />
          <Path
            d="m23 32 4 4 7-8m-11 19 4 4 7-8m-11 19 4 4 7-8"
            fill="none"
            stroke={GREEN}
            strokeWidth={3}
          />
          <Path d="M41 33h15M41 48h15M41 63h15" />
        </>
      );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" accessible={false}>
      <G
        stroke={INK}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {drawing}
      </G>
    </Svg>
  );
}

function Still({
  name,
  x,
  y,
  size = 80,
}: {
  name: GlyphName;
  x: number;
  y: number;
  size?: number;
}) {
  return (
    <View style={{ position: "absolute", left: x, top: y }}>
      <Glyph name={name} size={size} />
    </View>
  );
}

type TravelProps = {
  progress: Animated.Value;
  from: [number, number];
  to: [number, number];
  children: ReactNode;
  delay?: number;
  end?: number;
  shrink?: boolean;
  fade?: boolean;
};
function Travel({
  progress,
  from,
  to,
  children,
  delay = 0,
  end = 0.8,
  shrink,
  fade,
}: TravelProps) {
  const interpolate = (a: number, b: number) =>
    progress.interpolate({
      inputRange: [delay, end],
      outputRange: [a, b],
      extrapolate: "clamp",
    });
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        opacity: fade
          ? progress.interpolate({
              inputRange: [0, Math.max(end - 0.12, 0.01), end, 1],
              outputRange: [1, 1, 0, 0],
              extrapolate: "clamp",
            })
          : 1,
        transform: [
          { translateX: interpolate(from[0], to[0]) },
          { translateY: interpolate(from[1], to[1]) },
          { scale: interpolate(1, shrink ? 0.58 : 1) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function Appear({
  progress,
  at = 0.6,
  children,
  x,
  y,
}: {
  progress: Animated.Value;
  at?: number;
  children: ReactNode;
  x: number;
  y: number;
}) {
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: progress.interpolate({
          inputRange: [at, Math.min(at + 0.2, 1)],
          outputRange: [0, 1],
          extrapolate: "clamp",
        }),
        transform: [
          {
            scale: progress.interpolate({
              inputRange: [at, Math.min(at + 0.2, 1)],
              outputRange: [0.85, 1],
              extrapolate: "clamp",
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function Tick({ size = 33 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" accessible={false}>
      <Circle
        cx={18}
        cy={18}
        r={16}
        fill="#D8E6B9"
        stroke={INK}
        strokeWidth={2}
      />
      <Path
        d="m10 18 6 6 11-13"
        fill="none"
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function No({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" accessible={false}>
      <Circle cx={30} cy={30} r={26} fill="none" stroke={RED} strokeWidth={4} />
      <Path
        d="m12 12 36 36"
        stroke={RED}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Diagram({ children }: { children: ReactNode }) {
  return (
    <Svg
      width={320}
      height={220}
      viewBox="0 0 320 220"
      style={StyleSheet.absoluteFill}
      accessible={false}
    >
      {children}
    </Svg>
  );
}

function Arrow({ d, color = INK }: { d: string; color?: string }) {
  return (
    <Path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function BagScene({ step, progress }: Pick<Props, "step" | "progress">) {
  const c = useScenePalette();
  if (step === 4)
    return (
      <>
        <Still name="plan" x={28} y={78} size={86} />
        <Diagram>
          <Arrow d="M119 130h29m-7-6 7 6-7 6" color={c.muted} />
          <Path
            d="M167 186h118"
            stroke={c.muted}
            strokeWidth={2}
            strokeDasharray="3 6"
          />
        </Diagram>
        <Travel progress={progress} from={[151, 56]} to={[192, 56]} end={0.85}>
          <View style={{ width: 100, height: 130 }}>
            <Glyph name="person" size={120} />
            <View style={{ position: "absolute", left: -13, top: 40 }}>
              <Glyph name="bag" size={60} />
            </View>
          </View>
        </Travel>
        <Appear progress={progress} x={97} y={64}>
          <Tick />
        </Appear>
      </>
    );
  const packs: GlyphName[][] = [
    ["documents", "medicine"],
    ["bottle", "food"],
    ["torch", "radio", "battery"],
    ["shirt", "hygiene"],
  ];
  const items = packs[step] ?? packs[0];
  return (
    <>
      <Diagram>
        <Ellipse cx={227} cy={179} rx={63} ry={8} fill={c.text} opacity={0.1} />
        <Arrow d="M109 57q38-18 74 0m-3-8 3 8-9 1" color={c.muted} />
        <Path
          d="M20 178h96"
          stroke={c.muted}
          strokeWidth={2}
          strokeDasharray="3 6"
        />
      </Diagram>
      <Still name="bag" x={157} y={42} size={143} />
      {items.map((name, i) => (
        <Travel
          key={name}
          progress={progress}
          from={[21 + i * 33, 76 + i * 22]}
          to={step === 1 ? [i === 0 ? 151 : 238, 110] : [185 + i * 9, 71]}
          delay={i * 0.12}
          end={0.63 + i * 0.12}
          shrink
          fade
        >
          <Glyph name={name} size={64} />
        </Travel>
      ))}
      <Appear progress={progress} at={0.7} x={258} y={40}>
        <Tick />
      </Appear>
    </>
  );
}

function WaterScene({ step, progress }: Pick<Props, "step" | "progress">) {
  const c = useScenePalette();
  if (step === 0)
    return (
      <>
        <Diagram>
          <Rect
            x={161}
            y={164}
            width={119}
            height={15}
            rx={6}
            fill={c.sage}
            stroke={c.muted}
            strokeWidth={2}
          />
          <Arrow d="M117 108h54m-7-6 7 6-7 6" color={c.muted} />
          <Circle
            cx={88}
            cy={58}
            r={23}
            fill={PAPER}
            stroke={INK}
            strokeWidth={2}
          />
          <Path
            d="M74 53h28v8H74m5 5h18"
            fill={GREEN}
            stroke={INK}
            strokeWidth={2}
          />
          <Path
            d="m105 76 10 12"
            stroke={INK}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </Diagram>
        <Travel progress={progress} from={[31, 76]} to={[177, 59]}>
          <Glyph name="bottle" size={114} />
        </Travel>
        <Appear progress={progress} x={256} y={64}>
          <Tick />
        </Appear>
      </>
    );
  if (step === 1)
    return (
      <>
        <Still name="jug" x={69} y={49} size={141} />
        <Travel progress={progress} from={[120, 19]} to={[120, 68]} end={0.68}>
          <Svg width={41} height={18} viewBox="0 0 41 18" accessible={false}>
            <Rect
              x={2}
              y={2}
              width={37}
              height={14}
              rx={4}
              fill={GREEN}
              stroke={INK}
              strokeWidth={2}
            />
            <Path d="M9 5v8m8-8v8m8-8v8m8-8v8" stroke={INK} opacity={0.4} />
          </Svg>
        </Travel>
        <Diagram>
          <Arrow d="M226 61v42m-6-7 6 7 6-7" color={c.muted} />
        </Diagram>
        <Still name="chemical" x={239} y={114} size={52} />
        <View style={{ position: "absolute", left: 236, top: 112 }}>
          <No size={58} />
        </View>
        <Appear progress={progress} x={173} y={92}>
          <Tick />
        </Appear>
      </>
    );
  if (step === 2)
    return (
      <>
        <Diagram>
          <Path d="M27 55h160v113H27z" fill={c.sage} />
          <Path
            d="M20 52h174M27 165h161m-150 0v16m140-16v16"
            fill="none"
            stroke={INK}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            d="M24 52 40 31h136l16 21"
            fill={GREEN}
            stroke={INK}
            strokeWidth={2}
          />
          <Path
            d="M205 78v94"
            stroke={c.muted}
            strokeWidth={1.5}
            strokeDasharray="3 6"
          />
          <Circle
            cx={263}
            cy={52}
            r={15}
            fill={ORANGE}
            stroke={INK}
            strokeWidth={2}
          />
          <Path
            d="M263 29v-7m0 60v-7m23-23h7m-60 0h7m39-16 5-5m-42 42 5-5"
            stroke={INK}
            strokeWidth={2}
          />
        </Diagram>
        <Still name="bottle" x={111} y={86} size={78} />
        <Travel progress={progress} from={[218, 94]} to={[37, 82]}>
          <Glyph name="jug" size={86} />
        </Travel>
        <Still name="chemical" x={244} y={127} size={50} />
        <View style={{ position: "absolute", left: 240, top: 123 }}>
          <No size={58} />
        </View>
        <Appear progress={progress} x={154} y={57}>
          <Tick size={29} />
        </Appear>
      </>
    );
  if (step === 3)
    return (
      <>
        <Diagram>
          <Path d="M25 172h270" stroke={c.muted} strokeWidth={3} />
          <Arrow
            d="M80 55q76-37 151 0m-5-9 5 9-10 1M115 186H60m7-6-7 6 7 6"
            color={c.muted}
          />
        </Diagram>
        <Still name="bottle" x={126} y={81} size={92} />
        <Travel progress={progress} from={[64, 81]} to={[16, 93]} end={0.8}>
          <Glyph name="bottle" size={92} />
        </Travel>
        <Travel
          progress={progress}
          from={[259, 63]}
          to={[203, 81]}
          delay={0.2}
          end={0.88}
        >
          <Glyph name="bottle" size={92} />
        </Travel>
        <Travel
          progress={progress}
          from={[142, 17]}
          to={[146, 112]}
          end={0.73}
          shrink
        >
          <Glyph name="calendar" size={52} />
        </Travel>
        <Appear progress={progress} at={0.75} x={252} y={69}>
          <Tick size={29} />
        </Appear>
      </>
    );
  return (
    <>
      <Diagram>
        <Path
          d="M37 69V47h56v13H66v12m-3-21v-8m-10 0h20"
          fill="none"
          stroke={c.muted}
          strokeWidth={9}
          strokeLinecap="round"
        />
        <Path
          d="M62 86q-14 21 0 21t0-21"
          fill={WATER}
          stroke={INK}
          strokeWidth={2}
        />
        <Arrow d="M119 111h48m-7-6 7 6-7 6" color={c.muted} />
      </Diagram>
      <View style={{ position: "absolute", left: 31, top: 72 }}>
        <No size={64} />
      </View>
      <Still name="guidance" x={179} y={43} size={114} />
      <Travel progress={progress} from={[105, 149]} to={[208, 132]} end={0.75}>
        <Svg width={42} height={40} viewBox="0 0 42 40" accessible={false}>
          <Path
            d="M21 3 40 36H2z"
            fill="#F5D193"
            stroke={INK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Path
            d="M21 14v10m0 6v1"
            stroke={INK}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </Svg>
      </Travel>
      <Appear progress={progress} x={267} y={45}>
        <Tick />
      </Appear>
    </>
  );
}

function PowerScene({ step, progress }: Pick<Props, "step" | "progress">) {
  const c = useScenePalette();
  if (step === 0)
    return (
      <>
        <Diagram>
          <Arrow d="M122 114h43m-7-6 7 6-7 6" color={c.muted} />
          <Path d="M26 177h266" stroke={c.muted} strokeWidth={2} />
        </Diagram>
        <Still name="candle" x={28} y={82} size={88} />
        <Appear progress={progress} at={0.05} x={39} y={91}>
          <No size={65} />
        </Appear>
        <Appear progress={progress} at={0.3} x={172} y={25}>
          <Svg width={112} height={84} viewBox="0 0 112 84" accessible={false}>
            <Path d="m32 79-27-70h102L80 79z" fill="#F3D786" opacity={0.8} />
          </Svg>
        </Appear>
        <Travel progress={progress} from={[125, 123]} to={[180, 88]} end={0.75}>
          <Glyph name="torch" size={91} />
        </Travel>
        <Appear progress={progress} x={260} y={117}>
          <Tick />
        </Appear>
      </>
    );
  if (step === 1)
    return (
      <>
        <Still name="fridge" x={98} y={20} size={166} />
        <Animated.View
          style={{
            position: "absolute",
            left: 140,
            top: 47,
            transform: [
              { perspective: 600 },
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.8],
                  outputRange: [35, 0],
                  extrapolate: "clamp",
                }),
              },
              {
                rotateY: progress.interpolate({
                  inputRange: [0, 0.8],
                  outputRange: ["-62deg", "0deg"],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
        >
          <Svg width={91} height={122} viewBox="0 0 91 122" accessible={false}>
            <Rect
              x={2}
              y={2}
              width={87}
              height={118}
              rx={5}
              fill={PAPER}
              stroke={INK}
              strokeWidth={3}
            />
            <Path
              d="M2 43h87M13 52v25M13 16v15"
              stroke={INK}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
        <Diagram>
          <Arrow d="M76 102q-33 36 9 54m-1-9 1 9-9-1" color={c.muted} />
        </Diagram>
        <Appear progress={progress} x={242} y={81}>
          <Tick />
        </Appear>
      </>
    );
  if (step === 2)
    return (
      <>
        <Diagram>
          <Path d="M18 178h289" stroke={c.muted} strokeWidth={2} />
          <Path
            d="M171 51v125"
            stroke={c.muted}
            strokeDasharray="3 6"
            strokeWidth={1.5}
          />
          <Arrow d="M151 78h77m-7-6 7 6-7 6m-70-6-7 6 7 6" color={c.muted} />
          <Circle cx={285} cy={37} r={14} fill={ORANGE} />
        </Diagram>
        <Still name="house" x={10} y={51} size={137} />
        <Still name="generator" x={38} y={129} size={39} />
        <View style={{ position: "absolute", left: 32, top: 122 }}>
          <No size={52} />
        </View>
        <Travel
          progress={progress}
          from={[151, 117]}
          to={[226, 117]}
          end={0.85}
        >
          <Glyph name="generator" size={80} />
        </Travel>
        <Appear progress={progress} at={0.6} x={289} y={120}>
          <Svg width={27} height={40} viewBox="0 0 27 40" accessible={false}>
            <Arrow
              d="M1 16h22m-6-5 6 5-6 5M1 30h17m-5-4 5 4-5 4"
              color={c.muted}
            />
          </Svg>
        </Appear>
        <Appear progress={progress} at={0.78} x={260} y={93}>
          <Tick size={28} />
        </Appear>
      </>
    );
  return (
    <>
      <Still name="radio" x={28} y={93} size={100} />
      <Still name="phone" x={151} y={37} size={131} />
      <Animated.View
        style={{
          position: "absolute",
          left: 190,
          top: 63,
          width: 55,
          height: 78,
          borderRadius: 4,
          backgroundColor: INK,
          opacity: progress.interpolate({
            inputRange: [0, 0.8],
            outputRange: [0, 0.75],
            extrapolate: "clamp",
          }),
        }}
      />
      <Still name="battery" x={257} y={47} size={45} />
      <Travel progress={progress} from={[278, 174]} to={[216, 147]} end={0.65}>
        <Svg width={25} height={25} viewBox="0 0 25 25" accessible={false}>
          <Circle
            cx={12}
            cy={12}
            r={10}
            fill={PAPER}
            stroke={INK}
            strokeWidth={2}
          />
          <Circle cx={12} cy={12} r={4} fill={GREEN} />
        </Svg>
      </Travel>
      <Appear progress={progress} at={0.35} x={80} y={48}>
        <Svg width={46} height={53} viewBox="0 0 46 53" accessible={false}>
          <Path
            d="M10 36q15-12 0-24m10 32q25-20 0-40"
            fill="none"
            stroke={c.text}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </Appear>
      <Appear progress={progress} x={252} y={157}>
        <Tick />
      </Appear>
    </>
  );
}

function CommunicationScene({
  step,
  progress,
}: Pick<Props, "step" | "progress">) {
  const c = useScenePalette();
  if (step === 0)
    return (
      <>
        <Still name="phone" x={14} y={55} size={121} />
        <Still name="contact" x={194} y={65} size={107} />
        <Diagram>
          <Arrow d="M122 118h54m-7-6 7 6-7 6" color={c.muted} />
        </Diagram>
        <Travel progress={progress} from={[43, 94]} to={[217, 101]} end={0.8}>
          <Svg width={46} height={25} viewBox="0 0 46 25" accessible={false}>
            <Rect
              x={1}
              y={1}
              width={44}
              height={23}
              rx={5}
              fill={PAPER}
              stroke={INK}
              strokeWidth={2}
            />
            <Path
              d="M8 9h27M8 16h19"
              stroke={INK}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </Travel>
        <Appear progress={progress} x={266} y={53}>
          <Tick />
        </Appear>
      </>
    );
  if (step === 1)
    return (
      <>
        <Diagram>
          <Path
            d="m23 67 89-22 99 21 85-20v125l-85 20-99-22-89 23z"
            fill={c.sage}
            stroke={INK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Path
            d="M112 45v124m99-103v125"
            fill="none"
            stroke={INK}
            opacity={0.25}
          />
          <Path
            d="M43 161q26-54 71-29t58-10q25-44 93-18"
            fill="none"
            stroke={INK}
            strokeWidth={2}
            strokeDasharray="4 5"
          />
        </Diagram>
        <Still name="house" x={41} y={116} size={45} />
        <Travel progress={progress} from={[64, 22]} to={[64, 80]} end={0.5}>
          <Glyph name="pin" size={60} />
        </Travel>
        <Travel
          progress={progress}
          from={[221, 9]}
          to={[221, 60]}
          delay={0.35}
          end={0.88}
        >
          <Glyph name="pin" size={60} />
        </Travel>
        <Appear progress={progress} at={0.8} x={264} y={153}>
          <Tick size={28} />
        </Appear>
      </>
    );
  if (step === 2)
    return (
      <>
        <Still name="phone" x={3} y={55} size={124} />
        <Still name="phone" x={195} y={55} size={124} />
        <Diagram>
          <Arrow d="M108 65q52-40 103 0m-4-9 4 9-10 1" color={c.muted} />
        </Diagram>
        <Travel progress={progress} from={[39, 98]} to={[231, 98]} end={0.82}>
          <Svg width={51} height={39} viewBox="0 0 51 39" accessible={false}>
            <Path
              d="M6 2h39q4 0 4 4v23q0 4-4 4H17l-10 4v-4H6q-4 0-4-4V6q0-4 4-4z"
              fill="#D8E6B9"
              stroke={INK}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <Path
              d="M11 11h28M11 18h23M11 25h16"
              stroke={INK}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </Travel>
        <Appear progress={progress} at={0.8} x={263} y={155}>
          <Tick />
        </Appear>
      </>
    );
  return (
    <>
      <Still name="person" x={20} y={94} size={88} />
      <Still name="person" x={217} y={94} size={88} />
      <Diagram>
        <Arrow
          d="M107 78q52-47 105 0m-4-9 4 9-10 1M211 160q-53 31-104 0m4 9-4-9 10-1"
          color={c.muted}
        />
      </Diagram>
      <Travel progress={progress} from={[84, 137]} to={[123, 76]} end={0.7}>
        <Glyph name="plan" size={78} />
      </Travel>
      <Still name="battery" x={142} y={24} size={37} />
      <Appear progress={progress} at={0.65} x={74} y={82}>
        <Tick size={28} />
      </Appear>
      <Appear progress={progress} at={0.78} x={222} y={82}>
        <Tick size={28} />
      </Appear>
    </>
  );
}

/** A fixed illustration canvas scales uniformly, preserving action paths on phones. */
export function TutorialScene({ kind, step, progress }: Props) {
  const c = useScenePalette();
  const [width, setWidth] = useState(320);
  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    if (next > 0 && Math.abs(next - width) > 1) setWidth(next);
  };
  const stage = Math.max(
    0,
    Math.min(Math.floor(step), kind === "bag" || kind === "water" ? 4 : 3),
  );
  const background =
    kind === "water"
      ? c.blue
      : kind === "communication"
        ? c.purple
        : kind === "power"
          ? c.peach
          : c.sage;
  return (
    <View
      testID="tutorial-scene"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={onLayout}
      style={[
        styles.frame,
        {
          height: (width * 220) / 320,
          backgroundColor: c.appearance === "atlas" ? c.sceneBg : background,
          borderRadius: c.radius,
        },
      ]}
    >
      <View style={[styles.canvas, { transform: [{ scale: width / 320 }] }]}>
        <Diagram>
          <Circle cx={296} cy={16} r={88} fill={c.card} opacity={0.3} />
          <Circle cx={10} cy={205} r={70} fill={c.card} opacity={0.24} />
          <Path
            d="M17 204h286"
            stroke={c.text}
            strokeWidth={1}
            opacity={0.08}
          />
        </Diagram>
        {kind === "bag" ? <BagScene step={stage} progress={progress} /> : null}
        {kind === "water" ? (
          <WaterScene step={stage} progress={progress} />
        ) : null}
        {kind === "power" ? (
          <PowerScene step={stage} progress={progress} />
        ) : null}
        {kind === "communication" ? (
          <CommunicationScene step={stage} progress={progress} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: "100%", borderRadius: 24, overflow: "hidden" },
  canvas: {
    position: "absolute",
    width: 320,
    height: 220,
    left: "50%",
    top: "50%",
    marginLeft: -160,
    marginTop: -110,
  },
});
