import { useState, type ReactNode } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";

export type CivilSceneKind = "armed-conflict" | "nuclear-explosion";
type Props = { kind: CivilSceneKind; step: number; progress: Animated.Value };
const ink = "#234B61",
  paper = "#FFFDF3",
  blue = "#78A7C4",
  mint = "#A2C9B1",
  amber = "#E9BB76",
  skin = "#E8BD99";
const layer = {
  position: "absolute" as const,
  left: 0,
  top: 0,
  width: 320,
  height: 220,
};
function Canvas({ children }: { children: ReactNode }) {
  return (
    <Svg width={320} height={220} viewBox="0 0 320 220" accessible={false}>
      {children}
    </Svg>
  );
}
function Moving({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<Animated.AnimatedProps<ViewStyle>>;
}) {
  return (
    <Animated.View pointerEvents="none" style={[layer, style]}>
      <Canvas>{children}</Canvas>
    </Animated.View>
  );
}
function Person({
  x = 0,
  y = 0,
  small = false,
}: {
  x?: number;
  y?: number;
  small?: boolean;
}) {
  return (
    <G
      transform={`translate(${x} ${y}) scale(${small ? 0.72 : 1})`}
      stroke={ink}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx={15} cy={12} r={10} fill={skin} />
      <Path d="M6 25Q15 21 24 25L28 53H2Z" fill={mint} />
      <Path d="M8 53L6 74M22 53L24 74M5 31L-2 48M25 31L32 48" fill="none" />
    </G>
  );
}
function Shield({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <G
      transform={`translate(${x} ${y})`}
      stroke={ink}
      strokeWidth={2.5}
      strokeLinejoin="round"
    >
      <Path d="M0 8L20 0L40 8V29Q39 45 20 55Q1 45 0 29Z" fill={mint} />
      <Path d="M10 25L18 33L31 18" fill="none" strokeWidth={4} />
    </G>
  );
}
function Bag({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <G transform={`translate(${x} ${y})`} stroke={ink} strokeWidth={2.5}>
      <Path d="M12 12V7Q25-4 38 7V12" fill="none" />
      <Rect x={0} y={12} width={50} height={58} rx={12} fill={mint} />
      <Path d="M2 20H48V36Q25 45 2 36Z" fill={paper} />
      <Rect x={12} y={48} width={26} height={15} rx={4} fill={paper} />
    </G>
  );
}
function Radio({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <G
      transform={`translate(${x} ${y})`}
      stroke={ink}
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <Path d="M39 5L53-12" />
      <Rect y={5} width={63} height={43} rx={9} fill={blue} />
      <Rect x={9} y={13} width={43} height={8} rx={3} fill={paper} />
      <Circle cx={19} cy={34} r={8} fill={paper} />
      <Path d="M35 29H51M35 35H51M35 41H48" />
    </G>
  );
}
function Building({
  x = 0,
  y = 0,
  cutaway = false,
}: {
  x?: number;
  y?: number;
  cutaway?: boolean;
}) {
  return (
    <G
      transform={`translate(${x} ${y})`}
      stroke={ink}
      strokeWidth={3}
      strokeLinejoin="round"
    >
      <Path d="M0 25L65 0L130 25" fill={blue} />
      <Rect y={25} width={130} height={135} rx={5} fill={paper} />
      {cutaway ? (
        <>
          <Path d="M0 68H130M0 111H130M43 25V111M88 25V111" fill="none" />
          <Rect
            x={5}
            y={115}
            width={120}
            height={40}
            rx={3}
            fill={mint}
            stroke="none"
          />
          <Path d="M100 78H111V88H120V98H129V111" fill="none" />
        </>
      ) : (
        <>
          <Rect x={17} y={46} width={24} height={25} rx={3} fill="#C6DBE1" />
          <Rect x={89} y={46} width={24} height={25} rx={3} fill="#C6DBE1" />
          <Rect x={50} y={92} width={30} height={68} rx={4} fill={ink} />
          <Path d="M29 47V70M101 47V70" />
        </>
      )}
    </G>
  );
}
function Check({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Circle r={15} fill={mint} stroke={ink} strokeWidth={2} />
      <Path
        d="M-7 0L-2 5L8-7"
        fill="none"
        stroke={ink}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </G>
  );
}
function Ground() {
  return (
    <Path
      d="M15 197Q153 187 307 197"
      stroke={ink}
      strokeWidth={2}
      opacity={0.18}
      fill="none"
    />
  );
}
function Wave({ progress }: { progress: Animated.Value }) {
  return (
    <Moving
      style={{
        opacity: progress.interpolate({
          inputRange: [0, 0.25, 0.75, 1],
          outputRange: [0, 0.35, 0.2, 0],
        }),
        transform: [
          {
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [-35, 50],
            }),
          },
        ],
      }}
    >
      <Path
        d="M224 28Q264 80 224 127M247 17Q292 80 247 138"
        fill="none"
        stroke={amber}
        strokeWidth={8}
        strokeLinecap="round"
      />
    </Moving>
  );
}
function FamilyPlan({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Person x={28} y={112} />
        <Person x={69} y={131} small />
        <Bag x={200} y={113} />
        <Rect
          x={122}
          y={30}
          width={65}
          height={75}
          rx={9}
          fill={paper}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Circle cx={143} cy={52} r={7} fill={blue} />
        <Path d="M133 72H174M133 84H163" stroke={ink} strokeWidth={3} />
        <Path
          d="M97 146Q138 113 180 145"
          fill="none"
          stroke={blue}
          strokeDasharray="5 6"
          strokeWidth={3}
        />
      </Canvas>
      <Moving
        style={{
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-18, 0],
              }),
            },
          ],
          opacity: progress.interpolate({
            inputRange: [0, 0.4, 1],
            outputRange: [0, 1, 1],
          }),
        }}
      >
        <Check x={210} y={47} />
        <Radio x={124} y={137} />
      </Moving>
    </>
  );
}
function Shelter({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Rect
          x={35}
          y={33}
          width={250}
          height={157}
          rx={12}
          fill={paper}
          stroke={ink}
          strokeWidth={4}
        />
        <Rect
          x={58}
          y={52}
          width={47}
          height={45}
          rx={5}
          fill="#C6DBE1"
          stroke={ink}
          strokeWidth={3}
        />
        <Path d="M81 54V95M59 74H104" stroke={ink} strokeWidth={2} />
        <Path d="M141 34V190M141 98H284" stroke={ink} strokeWidth={8} />
        <Rect x={151} y={107} width={124} height={75} rx={8} fill={mint} />
        <Path
          d="M99 133L128 133M119 125L128 133L119 141"
          fill="none"
          stroke={ink}
          strokeWidth={3}
        />
      </Canvas>
      <Moving
        style={{
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-31, 0],
              }),
            },
          ],
        }}
      >
        <Person x={188} y={110} />
        <Person x={226} y={127} small />
      </Moving>
      <Moving
        style={{
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          }),
        }}
      >
        <Shield x={207} y={39} />
      </Moving>
    </>
  );
}
function Evacuation({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Building x={179} y={23} />
        <Path
          d="M25 185Q76 156 124 185Q153 203 184 174"
          fill="none"
          stroke={blue}
          strokeWidth={8}
          strokeDasharray="6 8"
        />
        <Rect
          x={26}
          y={28}
          width={113}
          height={48}
          rx={10}
          fill={paper}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Radio x={37} y={34} />
        <Path
          d="M109 42H129M122 36L129 42L122 48"
          fill="none"
          stroke={ink}
          strokeWidth={2.5}
        />
      </Canvas>
      <Moving
        style={{
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 58],
              }),
            },
          ],
        }}
      >
        <Person x={57} y={100} />
        <Person x={94} y={122} small />
      </Moving>
    </>
  );
}
function UnknownObjects({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Path
          d="M200 176L213 151L225 170L237 151L262 179"
          fill="#CCD4D9"
          stroke={ink}
          strokeWidth={2}
        />
        <Path
          d="M163 185L170 113L208 107L216 180"
          fill="none"
          stroke={ink}
          strokeWidth={4}
        />
        <Path
          d="M155 144H277"
          stroke={amber}
          strokeWidth={7}
          strokeDasharray="10 6"
        />
        <Path
          d="M174 93L196 51L218 93Z"
          fill={amber}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Path d="M196 66V79M196 85V87" stroke={ink} strokeWidth={4} />
        <Circle
          cx={250}
          cy={74}
          r={24}
          fill={paper}
          stroke="#A6544E"
          strokeWidth={3}
        />
        <Path d="M234 59L266 89" stroke="#A6544E" strokeWidth={4} />
        <Path
          d="M241 81V68Q244 62 247 68V75L250 64Q255 62 256 68V81"
          fill="none"
          stroke={ink}
          strokeWidth={2.5}
        />
        <Path
          d="M81 181H36M47 173L36 181L47 189"
          fill="none"
          stroke={blue}
          strokeWidth={4}
        />
      </Canvas>
      <Moving
        style={{
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [20, -8],
              }),
            },
          ],
        }}
      >
        <Person x={78} y={103} />
      </Moving>
    </>
  );
}
function OfficialInformation({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Person x={37} y={104} />
        <Person x={76} y={125} small />
        <Radio x={133} y={117} />
        <Rect
          x={218}
          y={38}
          width={62}
          height={95}
          rx={8}
          fill={paper}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Shield x={229} y={50} />
        <Path d="M232 115H266M232 122H257" stroke={ink} strokeWidth={2} />
      </Canvas>
      <Moving
        style={{
          opacity: progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.2, 0.75, 1],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        }}
      >
        <Path
          d="M148 104Q164 92 180 104M140 93Q164 73 188 93"
          fill="none"
          stroke={blue}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Check x={249} y={158} />
      </Moving>
    </>
  );
}
function BlastCover({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Path
          d="M262 16L269 37L290 42L270 51L266 72L255 52L234 46L253 37Z"
          fill={amber}
          opacity={0.65}
        />
        <Path
          d="M120 183V126H155V184"
          fill={blue}
          stroke={ink}
          strokeWidth={4}
        />
        <Path
          d="M54 166Q67 143 84 153L110 176H62Z"
          fill={mint}
          stroke={ink}
          strokeWidth={3}
        />
        <Circle
          cx={93}
          cy={153}
          r={11}
          fill={skin}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Path
          d="M73 147L83 137L106 143L108 156M65 177H110"
          fill="none"
          stroke={ink}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <Shield x={137} y={123} />
      </Canvas>
      <Wave progress={progress} />
    </>
  );
}
function EnterBuilding({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Building x={171} y={22} />
        <Path
          d="M41 183H169M158 175L170 183L158 191"
          stroke={blue}
          strokeWidth={4}
          fill="none"
        />
        <Check x={238} y={36} />
        <Path
          d="M21 53H91L104 79H14Z"
          fill="#C5CED7"
          stroke={ink}
          strokeWidth={2.5}
        />
        <Circle cx={35} cy={82} r={8} fill={ink} />
        <Circle cx={83} cy={82} r={8} fill={ink} />
        <Path d="M29 44L92 94" stroke="#A6544E" strokeWidth={4} />
      </Canvas>
      <Moving
        style={{
          opacity: progress.interpolate({
            inputRange: [0, 0.75, 1],
            outputRange: [1, 1, 0],
          }),
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 109],
              }),
            },
          ],
        }}
      >
        <Person x={107} y={108} />
      </Moving>
      <Moving
        style={{
          opacity: progress.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [0, 0, 1],
          }),
        }}
      >
        <Shield x={216} y={114} />
      </Moving>
    </>
  );
}
function Basement({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Rect x={25} y={178} width={272} height={27} rx={5} fill="#D3DDCC" />
        <Building x={94} y={16} cutaway />
        <Path
          d="M210 64L216 58M210 58L216 64"
          stroke="#A6544E"
          strokeWidth={3}
        />
        <Path
          d="M59 28V91M51 83L59 93L67 83"
          stroke={blue}
          strokeWidth={4}
          fill="none"
        />
        <Shield x={31} y={120} />
      </Canvas>
      <Moving
        style={{
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        }}
      >
        <G transform="translate(149 134) scale(.42)">
          <Person />
        </G>
      </Moving>
    </>
  );
}
function Decontamination({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Path
          d="M42 45L62 56L80 43L103 66L91 84L83 77V140H39V77L31 85L18 67Z"
          fill={blue}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Circle cx={48} cy={72} r={3} fill={amber} />
        <Circle cx={72} cy={99} r={3} fill={amber} />
        <Circle cx={62} cy={121} r={3} fill={amber} />
        <Path
          d="M113 97H144M136 89L144 97L136 105"
          stroke={ink}
          strokeWidth={3}
          fill="none"
        />
        <Path
          d="M140 140H189L197 184H133Z"
          fill={mint}
          stroke={ink}
          strokeWidth={3}
        />
        <Path d="M143 145H187M149 136L180 136" stroke={ink} strokeWidth={4} />
        <Path
          d="M143 154H188"
          stroke={ink}
          strokeWidth={2}
          strokeDasharray="3 3"
        />
        <Path
          d="M228 57V37Q228 23 246 23H273V41H251"
          fill="none"
          stroke={ink}
          strokeWidth={5}
        />
        <Path
          d="M245 41H271L275 49H241Z"
          fill={blue}
          stroke={ink}
          strokeWidth={2}
        />
        <Person x={242} y={102} />
        <Rect
          x={210}
          y={164}
          width={20}
          height={13}
          rx={5}
          fill={paper}
          stroke={ink}
          strokeWidth={2}
        />
      </Canvas>
      <Moving
        style={{
          opacity: progress.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0, 1, 1],
          }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 10],
              }),
            },
          ],
        }}
      >
        <Path
          d="M246 57V81M256 57V85M266 57V81"
          stroke={blue}
          strokeWidth={3}
          strokeDasharray="4 5"
        />
        <Check x={168} y={116} />
      </Moving>
    </>
  );
}
function StayInside({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Building x={90} y={18} cutaway />
        <G transform="translate(125 132) scale(.45)">
          <Person />
          <Person x={35} y={18} small />
        </G>
        <Radio x={237} y={132} />
        <Shield x={28} y={121} />
        <Path
          d="M236 42H284V83H236Z"
          fill={paper}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Path
          d="M244 52H275M244 62H275M244 72H265"
          stroke={blue}
          strokeWidth={3}
        />
      </Canvas>
      <Moving
        style={{
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1],
          }),
        }}
      >
        <Path
          d="M247 115Q262 102 277 115M239 104Q262 85 285 104"
          fill="none"
          stroke={blue}
          strokeWidth={3}
        />
      </Moving>
    </>
  );
}
function Supplies({ progress }: { progress: Animated.Value }) {
  return (
    <>
      <Canvas>
        <Ground />
        <Rect
          x={30}
          y={85}
          width={53}
          height={97}
          rx={10}
          fill="#BFDDE5"
          stroke={ink}
          strokeWidth={3}
        />
        <Rect
          x={39}
          y={70}
          width={35}
          height={18}
          rx={4}
          fill={mint}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Path
          d="M42 108H71M42 120H71M42 132H71"
          stroke={paper}
          strokeWidth={3}
        />
        <Rect
          x={101}
          y={109}
          width={65}
          height={73}
          rx={10}
          fill={amber}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Path d="M105 119H162M105 172H162" stroke={ink} strokeWidth={3} />
        <Rect
          x={188}
          y={104}
          width={51}
          height={78}
          rx={8}
          fill={paper}
          stroke={ink}
          strokeWidth={2.5}
        />
        <Rect
          x={199}
          y={92}
          width={29}
          height={14}
          rx={3}
          fill={blue}
          stroke={ink}
          strokeWidth={2}
        />
        <Rect
          x={202}
          y={128}
          width={23}
          height={22}
          rx={4}
          fill={amber}
          stroke={ink}
          strokeWidth={2}
        />
        <Path
          d="M207 128V122Q214 114 220 122V128"
          fill="none"
          stroke={ink}
          strokeWidth={3}
        />
        <Radio x={243} y={36} />
        <Path
          d="M262 104L239 118M245 110L238 118L249 118"
          stroke={ink}
          strokeWidth={2.5}
          fill="none"
        />
      </Canvas>
      <Moving
        style={{
          opacity: progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 1],
          }),
        }}
      >
        <Check x={56} y={46} />
        <Check x={133} y={78} />
      </Moving>
    </>
  );
}

export function CivilScene({ kind, step, progress }: Props) {
  const [width, setWidth] = useState(320),
    height = (width * 220) / 320;
  let scene: ReactNode;
  if (kind === "armed-conflict")
    scene =
      step === 0 ? (
        <FamilyPlan progress={progress} />
      ) : step === 1 ? (
        <Shelter progress={progress} />
      ) : step === 2 ? (
        <Evacuation progress={progress} />
      ) : step === 3 ? (
        <UnknownObjects progress={progress} />
      ) : (
        <OfficialInformation progress={progress} />
      );
  else
    scene =
      step === 0 ? (
        <BlastCover progress={progress} />
      ) : step === 1 ? (
        <EnterBuilding progress={progress} />
      ) : step === 2 ? (
        <Basement progress={progress} />
      ) : step === 3 ? (
        <Decontamination progress={progress} />
      ) : step === 4 ? (
        <StayInside progress={progress} />
      ) : (
        <Supplies progress={progress} />
      );
  return (
    <View
      testID="civil-scene"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      onLayout={(event) => {
        const measured = event.nativeEvent.layout.width;
        if (measured > 0 && Math.abs(measured - width) > 0.5)
          setWidth(measured);
      }}
      style={styles.frame}
    >
      <View
        style={{
          ...layer,
          left: (width - 320) / 2,
          top: (height - 220) / 2,
          transform: [{ scale: width / 320 }],
        }}
      >
        <Canvas>
          <Circle cx={288} cy={30} r={75} fill={paper} opacity={0.5} />
          <Circle cx={35} cy={205} r={64} fill={mint} opacity={0.15} />
        </Canvas>
        <View style={layer}>{scene}</View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {
    width: "100%",
    aspectRatio: 320 / 220,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E4EDF4",
  },
});
