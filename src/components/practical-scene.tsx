import { useState, type ReactNode } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

export type PracticalSceneKind =
  "adult-cpr" | "bleeding" | "burns" | "campfire";

type Props = {
  kind: PracticalSceneKind;
  step: number;
  progress: Animated.Value;
};

const ink = "#23463E";
const cream = "#FFF9EC";
const skin = "#E8BB96";
const sleeve = "#5D8D79";
const water = "#5299B6";
const blue = "#A5CDD8";
const wood = "#927251";

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
    <Animated.View pointerEvents="none" style={[styles.layer, style]}>
      <Canvas>{children}</Canvas>
    </Animated.View>
  );
}

function Phone({ x = 250, y = 41 }: { x?: number; y?: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Rect width={32} height={53} rx={8} fill={ink} />
      <Rect x={4} y={7} width={24} height={35} rx={3} fill={cream} />
      <Path d="M16 15V33M7 24H25" stroke={sleeve} strokeWidth={6} />
      <Circle cx={16} cy={47} r={2} fill={cream} />
    </G>
  );
}

function Adult({ bareChest = false }: { bareChest?: boolean }) {
  return (
    <G
      stroke={ink}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Ellipse
        cx={160}
        cy={197}
        rx={65}
        ry={8}
        fill={ink}
        opacity={0.09}
        stroke="none"
      />
      <Path
        d="M143 150L140 194H154L160 158L166 194H180L177 150"
        fill="#73979A"
      />
      <Path
        d="M137 80Q160 72 183 80L181 153Q160 164 139 153Z"
        fill={bareChest ? skin : cream}
      />
      <Path
        d="M137 86L116 112L111 149Q114 156 120 150L128 118L139 108M183 86L204 112L209 149Q206 156 200 150L192 118L181 108"
        fill={skin}
      />
      <Path d="M149 72V80Q160 87 171 80V72" fill={skin} />
      <Ellipse cx={160} cy={52} rx={23} ry={27} fill={skin} />
      <Path
        d="M138 48Q135 22 160 23Q185 22 183 48L176 38Q158 44 145 37Z"
        fill={ink}
        stroke="none"
      />
      <Path
        d="M148 54H152M168 54H172M156 65Q160 67 164 65"
        fill="none"
        strokeWidth={2}
      />
      <Path d="M160 91V127" stroke="#B8C8B8" strokeWidth={1.5} />
    </G>
  );
}

/** The hand pair is deliberately centred over the adult's sternum. */
function CompressionHands() {
  return (
    <G
      stroke={ink}
      strokeWidth={2.5}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Path d="M188 23L178 91L163 107L150 104L157 87L164 21" fill={skin} />
      <Path
        d="M211 32L187 97L170 116L155 115L151 110L166 103L178 86L185 26"
        fill={skin}
      />
      <Path d="M151 108L170 110M154 113L168 115" fill="none" />
      <Path d="M164 22L188 24M185 27L210 33" stroke={sleeve} strokeWidth={10} />
    </G>
  );
}

function Defibrillator({ pads = false }: { pads?: boolean }) {
  return (
    <G stroke={ink} strokeWidth={2} strokeLinejoin="round">
      <Rect x={28} y={104} width={59} height={62} rx={12} fill={sleeve} />
      <Path d="M42 105V97Q56 87 72 97V105" fill="none" strokeWidth={5} />
      <Rect
        x={37}
        y={116}
        width={41}
        height={22}
        rx={4}
        fill={cream}
        stroke="none"
      />
      <Path
        d="M41 128H49L53 120L58 134L63 126H74"
        fill="none"
        strokeWidth={2}
      />
      <Circle cx={58} cy={152} r={5} fill="#EFD794" />
      {pads ? (
        <G>
          <Path
            d="M86 130Q113 137 146 98M87 148Q114 179 178 130"
            fill="none"
            strokeWidth={1.5}
          />
          <Rect
            x={138}
            y={89}
            width={15}
            height={21}
            rx={4}
            fill={blue}
            transform="rotate(-17 146 100)"
          />
          <Rect
            x={171}
            y={121}
            width={15}
            height={21}
            rx={4}
            fill={blue}
            transform="rotate(17 179 131)"
          />
        </G>
      ) : null}
    </G>
  );
}

function OpenHand({ x = 232, y = 76 }: { x?: number; y?: number }) {
  return (
    <G
      transform={`translate(${x} ${y})`}
      stroke={ink}
      strokeWidth={2}
      strokeLinejoin="round"
    >
      <Path
        d="M7 46L0 29Q-1 24 4 24L12 34V9Q12 3 17 5V24V2Q21-3 25 2V24V6Q29 1 33 6V26V14Q37 9 41 15V40Q41 49 33 55L33 65H14V56Z"
        fill={skin}
      />
      <Path d="M12 57H35V68H12Z" fill={sleeve} />
    </G>
  );
}

function CprScene({ step, progress }: Omit<Props, "kind">) {
  const press = progress.interpolate({
    inputRange: [0, 0.3, 0.55, 0.8, 1],
    outputRange: [0, 0, 5, 0, 0],
  });
  return (
    <>
      <Canvas>
        <Path
          d="M93 16H224Q237 16 237 29V205H82V29Q82 16 93 16Z"
          fill="#D2E3DB"
        />
        <Adult bareChest={step === 4} />
        {step === 0 ? (
          <G stroke={ink} strokeWidth={2} fill="none">
            <Path
              d="M60 78L65 66L71 77L84 80L74 89L75 102L63 96L51 102L53 89L44 80Z"
              fill={cream}
            />
            <Path d="M58 84L63 89L71 79" />
          </G>
        ) : null}
        {step === 1 || step === 4 ? <Defibrillator pads={step === 4} /> : null}
        {step === 3 ? (
          <G>
            <Circle cx={263} cy={55} r={27} fill={cream} />
            <Path
              d="M246 61Q250 46 264 46Q278 46 279 61L264 69Z"
              fill={blue}
              stroke={ink}
              strokeWidth={2}
            />
            <Path
              d="M258 47V40H270V47"
              fill={cream}
              stroke={ink}
              strokeWidth={2}
            />
          </G>
        ) : null}
        {step === 4 ? (
          <G stroke={ink} strokeWidth={2}>
            <Circle cx={268} cy={51} r={24} fill={cream} />
            <Path
              d="M257 43V54L262 60H275L279 49V42M261 49V36M267 48V33M273 48V36"
              fill="none"
              strokeLinecap="round"
            />
            <Line
              x1={251}
              y1={67}
              x2={284}
              y2={34}
              stroke="#9E5C44"
              strokeWidth={3}
            />
          </G>
        ) : null}
      </Canvas>
      {step === 0 ? (
        <Moving
          style={{
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.65, 1],
                  outputRange: [31, 0, 0],
                }),
              },
            ],
          }}
        >
          <G stroke={ink} strokeWidth={2.5} strokeLinejoin="round">
            <Path
              d="M289 82L236 74L207 80L190 81Q179 82 181 89L199 94L214 88L237 88L285 104"
              fill={skin}
            />
            <Path d="M280 80L287 105L309 106V82Z" fill={sleeve} />
          </G>
        </Moving>
      ) : null}
      {step === 1 ? (
        <Moving
          style={{
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [30, 0, 0],
                }),
              },
            ],
          }}
        >
          <Phone x={248} y={66} />
        </Moving>
      ) : null}
      {step === 2 || step === 3 ? (
        <Moving style={{ transform: [{ translateY: press }] }}>
          <CompressionHands />
        </Moving>
      ) : null}
      {step === 4 ? (
        <Moving
          style={{
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [-16, 17, 17],
                }),
              },
            ],
          }}
        >
          <OpenHand x={237} y={104} />
        </Moving>
      ) : null}
    </>
  );
}

function Forearm() {
  return (
    <G
      stroke={ink}
      strokeWidth={2.5}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Path
        d="M31 116L185 113L219 103L248 108L276 105Q283 107 279 113L252 119L282 119Q289 122 282 127L251 130L279 133Q284 138 277 141L247 141L263 148Q267 153 261 156L232 147L212 149L184 142L31 149Z"
        fill={skin}
      />
      <Path d="M31 111H65V154H31Z" fill={sleeve} />
      <Path d="M241 121L232 131L218 132" fill="none" />
    </G>
  );
}

function Cloth({ loose = false }: { loose?: boolean }) {
  return (
    <G stroke={ink} strokeWidth={2} strokeLinejoin="round">
      <Path
        d={
          loose
            ? "M91 112Q135 99 186 111L207 136Q149 131 89 142L80 128Z"
            : "M116 112L175 108L191 140L123 147L111 131Z"
        }
        fill={cream}
      />
      <Path
        d={
          loose
            ? "M96 122Q144 113 190 124M103 134L164 126"
            : "M125 120L169 117M127 135L177 128"
        }
        fill="none"
        stroke="#C7C9B8"
        strokeWidth={1.5}
      />
    </G>
  );
}

function PressureHand({ glove = false }: { glove?: boolean }) {
  return (
    <G
      stroke={ink}
      strokeWidth={2.5}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Path
        d="M147 22L140 89L128 109L123 120L131 126L146 124L164 127L176 121L169 109L166 94L173 24"
        fill={glove ? blue : skin}
      />
      <Path
        d="M137 115L161 119M141 108L163 113"
        fill="none"
        strokeWidth={1.5}
      />
      <Path d="M145 25L174 27" stroke={sleeve} strokeWidth={13} />
    </G>
  );
}

function BleedingScene({ step, progress }: Omit<Props, "kind">) {
  return (
    <>
      <Canvas>
        <Ellipse cx={160} cy={165} rx={128} ry={12} fill={ink} opacity={0.08} />
        <Forearm />
        {step === 0 ? <Phone x={249} y={31} /> : null}
        {step >= 2 ? <Cloth /> : null}
        {step === 3 ? <PressureHand glove /> : null}
        {step === 3 ? (
          <G stroke={ink} strokeWidth={2}>
            <Circle cx={68} cy={53} r={20} fill={skin} />
            <Path d="M47 51Q45 26 69 30Q90 30 88 49L80 42L51 43Z" fill={ink} />
            <Path d="M35 100Q37 74 67 75Q91 75 98 100" fill={sleeve} />
          </G>
        ) : null}
      </Canvas>
      {step === 0 ? (
        <Moving
          style={{
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 0.75, 1],
                  outputRange: [-32, -6, -6],
                }),
              },
            ],
          }}
        >
          <PressureHand glove />
        </Moving>
      ) : null}
      {step === 1 ? (
        <Moving
          style={{
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 0.65, 1],
                  outputRange: [-51, 0, 0],
                }),
              },
            ],
          }}
        >
          <Cloth />
          <PressureHand glove />
        </Moving>
      ) : null}
      {step === 2 ? (
        <>
          <Moving>
            <PressureHand glove />
          </Moving>
          <Moving
            style={{
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 0.55, 1],
                    outputRange: [-9, 0, 0],
                  }),
                },
              ],
            }}
          >
            <Path
              d="M111 78V98M105 92L111 98L117 92M188 78V98M182 92L188 98L194 92"
              stroke={sleeve}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Moving>
        </>
      ) : null}
      {step === 3 ? (
        <Moving
          style={{
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.6, 1],
                  outputRange: [-16, 0, 0],
                }),
              },
              {
                translateY: progress.interpolate({
                  inputRange: [0, 0.6, 1],
                  outputRange: [12, 0, 0],
                }),
              },
            ],
          }}
        >
          <Phone x={85} y={36} />
        </Moving>
      ) : null}
    </>
  );
}

function Faucet() {
  return (
    <G stroke={ink} strokeWidth={2.5} strokeLinejoin="round" fill={blue}>
      <Path d="M250 25V53H224Q210 53 210 69V78H228V74Q228 69 235 69H268V25Z" />
      <Path d="M240 30H277M258 22V37" strokeWidth={5} strokeLinecap="round" />
    </G>
  );
}

function BurnsScene({ step, progress }: Omit<Props, "kind">) {
  return (
    <>
      <Canvas>
        <Ellipse cx={160} cy={168} rx={128} ry={10} fill={ink} opacity={0.08} />
        {step !== 0 ? <Forearm /> : null}
        {step === 0 ? (
          <G stroke={ink} strokeWidth={2.5} strokeLinejoin="round">
            <Rect x={25} y={67} width={48} height={39} rx={8} fill="#CAA78B" />
            <Path d="M72 73H84Q95 86 84 98H72M22 108H77" fill="none" />
            <Path
              d="M37 58Q30 49 37 41M53 58Q46 49 53 41"
              fill="none"
              stroke="#AD785A"
              strokeWidth={2}
            />
            <Path d="M266 171H302L298 179H270Z" fill={cream} />
          </G>
        ) : null}
        {step === 1 ? (
          <G>
            <Faucet />
            <Path
              d="M212 80L209 135M219 80V135M226 80L229 132"
              stroke={water}
              strokeWidth={2}
              opacity={0.3}
            />
            <Path
              d="M197 155Q219 168 246 155"
              stroke={water}
              strokeWidth={2}
              fill="none"
            />
          </G>
        ) : null}
        {step === 3 ? <Cloth loose /> : null}
        {step === 3 ? (
          <G stroke={ink} strokeWidth={2}>
            <Rect x={41} y={35} width={55} height={48} rx={10} fill={cream} />
            <Path d="M69 44V73M55 58H83" stroke={sleeve} strokeWidth={8} />
          </G>
        ) : null}
      </Canvas>
      {step === 0 ? (
        <>
          <Moving
            style={{
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [-16, 9, 9],
                  }),
                },
              ],
            }}
          >
            <Forearm />
          </Moving>
          <Moving
            style={{
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 0.5, 0.9, 1],
                    outputRange: [-16, 9, 33, 33],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 0.5, 0.9, 1],
                    outputRange: [0, 0, 48, 48],
                  }),
                },
              ],
            }}
          >
            <Ellipse
              cx={258}
              cy={120}
              rx={5}
              ry={8}
              stroke="#9D7830"
              strokeWidth={3}
              fill="none"
            />
          </Moving>
        </>
      ) : null}
      {step === 1 ? (
        <Moving
          style={{
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 32],
                }),
              },
            ],
            opacity: progress.interpolate({
              inputRange: [0, 0.15, 0.8, 1],
              outputRange: [0.35, 1, 1, 0.35],
            }),
          }}
        >
          <G stroke={water} strokeWidth={3} strokeLinecap="round">
            <Path d="M213 83L212 93M220 89V100M226 80L227 90" />
          </G>
        </Moving>
      ) : null}
      {step === 2 ? (
        <Moving
          style={{
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 0.75, 1],
                  outputRange: [-47, 0, 0],
                }),
              },
            ],
          }}
        >
          <Cloth loose />
        </Moving>
      ) : null}
      {step === 3 ? (
        <Moving
          style={{
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [19, 0, 0],
                }),
              },
              {
                translateY: progress.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [12, 0, 0],
                }),
              },
            ],
          }}
        >
          <Phone x={248} y={40} />
        </Moving>
      ) : null}
    </>
  );
}

function FireRing() {
  return (
    <G stroke={ink} strokeWidth={1.5}>
      <Ellipse cx={184} cy={165} rx={70} ry={29} fill="#D8CFBA" stroke="none" />
      <Ellipse cx={184} cy={159} rx={49} ry={17} fill="#A99A82" stroke="none" />
      {[
        [123, 157, -14],
        [138, 141, -20],
        [167, 134, -6],
        [198, 134, 6],
        [229, 143, 20],
        [244, 160, 24],
        [227, 178, -15],
        [199, 186, -6],
        [168, 186, 5],
        [140, 178, 20],
      ].map(([x, y, r], index) => (
        <Ellipse
          key={index}
          cx={x}
          cy={y}
          rx={13}
          ry={8}
          fill={index % 2 ? "#B9B9A7" : "#D0CEBA"}
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
    </G>
  );
}

function Bucket({ x = 48, y = 124 }: { x?: number; y?: number }) {
  return (
    <G
      transform={`translate(${x} ${y})`}
      stroke={ink}
      strokeWidth={2.5}
      strokeLinejoin="round"
    >
      <Path d="M0 7L6 44H34L40 7Z" fill={blue} />
      <Ellipse cx={20} cy={7} rx={20} ry={6} fill={water} />
      <Path d="M3 11V0Q20-20 37 0V11" fill="none" />
      <Path d="M10 17L13 35" stroke={cream} opacity={0.7} />
    </G>
  );
}

function Kindling() {
  return (
    <G
      stroke={ink}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M157 151L209 165L214 159L162 144Z" fill={wood} />
      <Path d="M155 161L204 144L210 150L161 168Z" fill="#B99466" />
      <Path
        d="M167 155L190 151L197 158L181 165Z"
        fill="#D1BE8E"
        strokeWidth={1.5}
      />
      <Path d="M173 154L183 159L190 154" fill="none" strokeWidth={1} />
    </G>
  );
}

function Flame() {
  return (
    <G>
      <Path
        d="M168 156Q149 142 168 120Q168 133 176 130Q169 111 188 95Q184 115 197 125Q217 145 200 158Z"
        fill="#D99750"
      />
      <Path
        d="M178 158Q167 146 179 132Q180 142 186 139L190 123Q205 149 192 159Z"
        fill="#F1D28C"
      />
    </G>
  );
}

function CampfireScene({ step, progress }: Omit<Props, "kind">) {
  return (
    <>
      <Canvas>
        <Circle cx={185} cy={137} r={87} fill="#D7E3C6" />
        <Path
          d="M15 108L35 65L55 108ZM261 99L278 59L297 99Z"
          fill="#98B18B"
          opacity={0.55}
        />
        <Path
          d="M35 105V120M279 95V109"
          stroke={ink}
          strokeWidth={3}
          opacity={0.25}
        />
        <Path
          d="M18 189Q121 199 304 190"
          stroke={ink}
          strokeWidth={1.5}
          opacity={0.16}
          fill="none"
        />
        <FireRing />
        {step > 0 && step < 4 ? <Bucket /> : null}
        {step >= 2 ? <Kindling /> : null}
        {step === 0 ? (
          <G stroke={ink} strokeWidth={2.5} strokeLinejoin="round">
            <Rect x={245} y={23} width={43} height={37} rx={9} fill={cream} />
            <Path
              d="M255 41L263 49L278 32"
              stroke={sleeve}
              strokeWidth={4}
              fill="none"
            />
          </G>
        ) : null}
        {step === 3 ? (
          <G stroke={ink} strokeWidth={2.5} strokeLinejoin="round">
            <Circle cx={62} cy={66} r={17} fill={skin} />
            <Path d="M46 61Q44 43 63 46Q80 45 79 64L70 56L49 57Z" fill={ink} />
            <Path d="M49 86Q68 80 79 97L85 125L65 132L47 115Z" fill={sleeve} />
            <Path d="M60 124L87 139L106 173H92L74 150L50 143Z" fill="#7E9494" />
            <Path d="M73 96L88 115L103 111L106 117L87 125L68 109" fill={skin} />
            <Path
              d="M39 144H72M44 145L40 169M67 145L72 166"
              fill="none"
              stroke={wood}
              strokeWidth={5}
            />
          </G>
        ) : null}
        {step === 4 ? (
          <Path
            d="M144 178Q179 165 222 178"
            stroke={water}
            strokeWidth={4}
            opacity={0.45}
            fill="none"
          />
        ) : null}
      </Canvas>
      {step === 0 ? (
        <Moving
          style={{
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.75, 1],
                  outputRange: [-27, 0, 0],
                }),
              },
            ],
          }}
        >
          <Bucket />
        </Moving>
      ) : null}
      {step === 1 ? (
        <Moving
          style={{
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.75, 1],
                  outputRange: [-35, 0, 0],
                }),
              },
              {
                translateY: progress.interpolate({
                  inputRange: [0, 0.75, 1],
                  outputRange: [-38, 0, 0],
                }),
              },
            ],
          }}
        >
          <Kindling />
        </Moving>
      ) : null}
      {step === 2 ? (
        <Moving
          style={{
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.65, 1],
                  outputRange: [34, 0, 0],
                }),
              },
              {
                translateY: progress.interpolate({
                  inputRange: [0, 0.65, 1],
                  outputRange: [-34, 0, 0],
                }),
              },
            ],
          }}
        >
          <G stroke={ink} strokeWidth={2} strokeLinecap="round">
            <Path d="M192 139L225 106" stroke="#B99466" strokeWidth={5} />
            <Circle cx={191} cy={140} r={4} fill="#B57143" stroke="none" />
            <Path
              d="M188 139Q181 132 191 121Q190 128 196 131Q200 139 193 142Z"
              fill="#E4AC59"
              stroke="none"
            />
            <Path
              d="M222 101L246 80L258 91L232 113Q226 118 221 113Z"
              fill={skin}
            />
          </G>
        </Moving>
      ) : null}
      {step === 3 ? (
        <Moving
          style={{
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [-2, 2, -2],
                }),
              },
            ],
          }}
        >
          <Flame />
        </Moving>
      ) : null}
      {step === 4 ? (
        <>
          <Moving
            style={{
              opacity: progress.interpolate({
                inputRange: [0, 0.55, 1],
                outputRange: [1, 0, 0],
              }),
            }}
          >
            <Flame />
          </Moving>
          <Moving
            style={{
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [-7, 6, 6],
                  }),
                },
              ],
              opacity: progress.interpolate({
                inputRange: [0, 0.1, 0.6, 0.75, 1],
                outputRange: [0, 1, 1, 0, 0],
              }),
            }}
          >
            <G stroke={water} strokeWidth={3} strokeLinecap="round" fill="none">
              <Path d="M126 109Q155 119 172 146M133 108Q161 117 185 147M141 111Q169 120 195 144" />
            </G>
          </Moving>
          <Moving
            style={{
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 0.35, 0.7, 1],
                    outputRange: [0, -4, 6, -4],
                  }),
                },
              ],
            }}
          >
            <G transform="translate(106 94) rotate(-46)">
              <Bucket x={-20} y={-20} />
            </G>
          </Moving>
          <Moving
            style={{
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 0.55, 0.75, 1],
                    outputRange: [0, 0, -10, 8],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 0.55, 0.75, 1],
                    outputRange: [-12, -12, 0, 0],
                  }),
                },
              ],
            }}
          >
            <Path
              d="M205 158L257 98"
              stroke={wood}
              strokeWidth={6}
              strokeLinecap="round"
            />
          </Moving>
        </>
      ) : null}
    </>
  );
}

/** Local storyboard art; the player supplies progress and accessible instructions. */
export function PracticalScene({ kind, step, progress }: Props) {
  const [width, setWidth] = useState(320);
  const height = (width * 220) / 320;
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      onLayout={(event) => {
        const measured = event.nativeEvent.layout.width;
        if (measured > 0 && Math.abs(measured - width) > 0.5)
          setWidth(measured);
      }}
      style={[
        styles.frame,
        { backgroundColor: kind === "campfire" ? "#EAF0DD" : "#E5EFED" },
      ]}
    >
      <View
        style={{
          width: 320,
          height: 220,
          position: "absolute",
          left: (width - 320) / 2,
          top: (height - 220) / 2,
          transform: [{ scale: width / 320 }],
        }}
      >
        <Canvas>
          <Circle cx={292} cy={25} r={70} fill={cream} opacity={0.45} />
          <Circle cx={26} cy={209} r={63} fill={cream} opacity={0.4} />
        </Canvas>
        <View style={styles.layer}>
          {kind === "adult-cpr" ? (
            <CprScene step={step} progress={progress} />
          ) : null}
          {kind === "bleeding" ? (
            <BleedingScene step={step} progress={progress} />
          ) : null}
          {kind === "burns" ? (
            <BurnsScene step={step} progress={progress} />
          ) : null}
          {kind === "campfire" ? (
            <CampfireScene step={step} progress={progress} />
          ) : null}
        </View>
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
  },
  layer: { position: "absolute", left: 0, top: 0, width: 320, height: 220 },
});
