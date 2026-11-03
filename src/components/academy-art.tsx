import { View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect, Line } from "react-native-svg";
import type { AcademyArtKind } from "../data/academy";

/** Small bundled illustrations: no remote images, trackers or video thumbnails. */
export function AcademyArt({
  kind,
  color = "#BDD6C8",
  height = 150,
}: {
  kind: AcademyArtKind;
  color?: string;
  height?: number;
}) {
  const ink = "#23463E",
    light = "#FFF9E9",
    green = "#668F70";
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        height,
        backgroundColor: color,
        borderRadius: 22,
        overflow: "hidden",
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 320 180" accessible={false}>
        <Circle cx={265} cy={35} r={63} fill="#FFFFFF" opacity={0.15} />
        <Circle cx={47} cy={151} r={71} fill="#FFFFFF" opacity={0.13} />
        <Path
          d="M14 160Q110 133 177 156T319 145"
          stroke={ink}
          strokeWidth={1.5}
          fill="none"
          opacity={0.14}
        />
        <Ellipse cx={163} cy={150} rx={80} ry={10} fill={ink} opacity={0.12} />
        {kind === "bag" ? (
          <G>
            <Path
              d="M129 56V45Q129 33 145 33H168Q184 33 184 45V56"
              fill="none"
              stroke={ink}
              strokeWidth={8}
            />
            <Rect
              x={105}
              y={48}
              width={106}
              height={104}
              rx={23}
              fill={green}
              stroke={ink}
              strokeWidth={3}
            />
            <Path
              d="M118 49H199V88Q159 108 118 88Z"
              fill={light}
              stroke={ink}
              strokeWidth={3}
            />
            <Rect
              x={125}
              y={109}
              width={66}
              height={33}
              rx={8}
              fill="#D8E4B7"
              stroke={ink}
              strokeWidth={2}
            />
            <Path
              d="M148 89V105M169 89V105"
              stroke={ink}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <Rect x={93} y={91} width={14} height={48} rx={5} fill={ink} />
            <Rect x={211} y={91} width={14} height={48} rx={5} fill={ink} />
            <Circle cx={249} cy={74} r={18} fill={light} />
            <Path
              d="m241 74 6 6 11-13"
              stroke={ink}
              strokeWidth={3}
              fill="none"
            />
          </G>
        ) : null}
        {kind === "water" ? (
          <G>
            <Path
              d="M108 64V48H136V64L146 79V141Q146 150 137 150H107Q98 150 98 141V79Z"
              fill={light}
              stroke={ink}
              strokeWidth={3}
            />
            <Rect x={105} y={40} width={34} height={13} rx={4} fill={ink} />
            <Path
              d="M100 99Q122 89 145 99V138Q145 148 136 148H108Q100 148 100 138Z"
              fill="#75ACBE"
            />
            <Path
              d="M174 48V30H202V48L215 65V140Q215 150 204 150H173Q162 150 162 140V65Z"
              fill={light}
              stroke={ink}
              strokeWidth={3}
            />
            <Rect x={171} y={23} width={34} height={13} rx={4} fill={ink} />
            <Path
              d="M164 87Q187 76 213 87V138Q213 148 203 148H174Q164 148 164 138Z"
              fill="#75ACBE"
            />
            <Path
              d="M188 99C175 115 175 121 188 127C201 121 201 115 188 99"
              fill={light}
            />
            <Path
              d="M236 90C218 112 218 122 236 130C254 122 254 112 236 90"
              fill={light}
              opacity={0.7}
            />
          </G>
        ) : null}
        {kind === "home" ? (
          <G>
            <Path
              d="M88 90 158 32 231 90"
              fill={ink}
              stroke={ink}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M103 86 158 43 214 86V148H103Z"
              fill={light}
              stroke={ink}
              strokeWidth={3}
            />
            <Rect x={145} y={105} width={29} height={43} rx={3} fill={green} />
            <Circle cx={166} cy={127} r={2} fill={light} />
            <Rect x={115} y={91} width={20} height={23} rx={3} fill="#87B7BE" />
            <Rect x={183} y={91} width={20} height={23} rx={3} fill="#87B7BE" />
            <Path
              d="M119 101H131M125 94V111M187 101H199M193 94V111"
              stroke={light}
              strokeWidth={2}
            />
            <Circle cx={252} cy={58} r={24} fill={light} />
            <Path
              d="m242 58 7 7 14-16"
              stroke={ink}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M78 149V117M65 131H91"
              stroke={green}
              strokeWidth={6}
              strokeLinecap="round"
            />
          </G>
        ) : null}
        {kind === "medical" ? (
          <G>
            <Path
              d="M129 64V44H191V64"
              fill="none"
              stroke={ink}
              strokeWidth={8}
              strokeLinejoin="round"
            />
            <Rect
              x={88}
              y={61}
              width={145}
              height={87}
              rx={20}
              fill={light}
              stroke={ink}
              strokeWidth={3}
            />
            <Rect x={148} y={81} width={25} height={50} rx={3} fill="#C9685F" />
            <Rect x={135} y={94} width={51} height={24} rx={3} fill="#C9685F" />
            <Path
              d="M110 64V145M212 64V145"
              stroke={ink}
              strokeWidth={3}
              opacity={0.25}
            />
            <Circle cx={250} cy={55} r={17} fill={ink} />
            <Path d="M243 55H257M250 48V62" stroke={light} strokeWidth={3} />
          </G>
        ) : null}
        {kind === "radio" ? (
          <G>
            <Path
              d="M190 61 223 22"
              stroke={ink}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <Rect x={91} y={63} width={140} height={86} rx={19} fill={ink} />
            <Rect
              x={107}
              y={77}
              width={108}
              height={20}
              rx={5}
              fill="#D7E5AF"
            />
            <Path d="M114 87H204M154 81V94" stroke={ink} strokeWidth={2} />
            <Circle cx={132} cy={121} r={17} fill={light} />
            <Circle cx={132} cy={121} r={10} fill={green} />
            <Path
              d="M164 111H210M164 120H210M164 129H200"
              stroke={light}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <Path
              d="M68 75Q52 91 68 107M53 63Q27 91 53 120"
              stroke={ink}
              strokeWidth={3}
              fill="none"
              opacity={0.5}
            />
            <Path
              d="M246 75Q262 91 246 107"
              stroke={ink}
              strokeWidth={3}
              fill="none"
              opacity={0.5}
            />
          </G>
        ) : null}
        {kind === "power" ? (
          <G>
            <Rect x={99} y={81} width={115} height={68} rx={15} fill={ink} />
            <Path
              d="M127 81V65H184V81"
              stroke={ink}
              strokeWidth={7}
              fill="none"
            />
            <Rect x={110} y={95} width={47} height={19} rx={4} fill="#D1E4A0" />
            <Circle cx={185} cy={115} r={13} fill={light} />
            <Path
              d="M127 129H150"
              stroke={light}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <Path
              d="m169 22-25 34h18l-5 27 29-38h-18Z"
              fill={light}
              stroke={ink}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <Path d="M233 93 271 70V141L233 123Z" fill={light} opacity={0.35} />
            <Rect x={218} y={92} width={19} height={34} rx={4} fill={green} />
            <Line
              x1={85}
              y1={44}
              x2={98}
              y2={56}
              stroke={ink}
              strokeWidth={3}
            />
            <Line
              x1={215}
              y1={33}
              x2={207}
              y2={48}
              stroke={ink}
              strokeWidth={3}
            />
          </G>
        ) : null}
        {kind === "outdoor" ? (
          <G>
            <Circle cx={231} cy={49} r={22} fill={light} />
            <Path d="m51 149 70-100 62 100Z" fill={green} />
            <Path d="m119 149 69-114 87 114Z" fill={ink} />
            <Path d="m166 71 22-36 28 36-17-7-11 12-10-12Z" fill={light} />
            <Path d="m104 73 17-24 15 24-15-6Z" fill={light} />
            <Path
              d="M152 149 180 124 165 110 183 90"
              stroke="#D8C39B"
              strokeWidth={5}
              fill="none"
            />
            <Path
              d="M57 148V104M37 130 57 99 77 130Z"
              fill={green}
              stroke={ink}
              strokeWidth={2}
            />
          </G>
        ) : null}
        {kind === "food" ? (
          <G>
            <Rect
              x={95}
              y={58}
              width={63}
              height={91}
              rx={6}
              fill={light}
              stroke={ink}
              strokeWidth={3}
            />
            <Ellipse cx={126} cy={58} rx={31} ry={7} fill={ink} />
            <Rect x={98} y={80} width={57} height={45} fill={green} />
            <Path
              d="M126 90C109 99 113 116 126 116C139 116 143 99 126 90Z"
              fill={light}
            />
            <Rect
              x={172}
              y={79}
              width={56}
              height={70}
              rx={6}
              fill={light}
              stroke={ink}
              strokeWidth={3}
            />
            <Ellipse cx={200} cy={79} rx={28} ry={6} fill={ink} />
            <Rect x={175} y={96} width={50} height={35} fill="#C8A16B" />
            <Path
              d="M190 105H211M190 113H205M190 121H210"
              stroke={light}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </G>
        ) : null}
      </Svg>
    </View>
  );
}
