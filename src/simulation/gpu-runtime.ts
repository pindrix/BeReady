/** Embedded, network-free WebGL renderer. Built with scripts/build-graphics.mjs. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildScene } from "./scenes";
import { graphicsFrame, type GraphicsFrame } from "./graphics-protocol";
import type { Face, Primitive } from "./geometry";
declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (data: string) => void };
    beReadyGraphics?: {
      render: (data: GraphicsFrame) => void;
      dispose: () => void;
    };
  }
}
const emit = (type: "ready" | "rendered" | "error") => {
  const message = JSON.stringify({ channel: "be-ready-graphics", type });
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(message);
  else parent.postMessage(message, "*");
};
try {
  const canvas = document.querySelector("canvas")!;
  let painted = false;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.debug.onShaderError = () => emit("error");
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const world = new THREE.Scene();
  world.background = new THREE.Color("#CADBD8");
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
  const ambient = new THREE.HemisphereLight("#DFEEFF", "#C9AC85", 1.05);
  world.add(ambient);
  const sun = new THREE.DirectionalLight("#FFF0D8", 2.8);
  sun.position.set(-3, 6, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -4;
  sun.shadow.camera.right = 4;
  sun.shadow.camera.top = 4;
  sun.shadow.camera.bottom = -4;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 18;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 3;
  world.add(sun);
  const fill = new THREE.DirectionalLight("#AFD9EA", 0.65);
  fill.position.set(4, 3, -2);
  world.add(fill);
  const pmrem = new THREE.PMREMGenerator(renderer),
    environment = new RoomEnvironment();
  const environmentMap = pmrem.fromScene(environment, 0.04);
  world.environment = environmentMap.texture;
  world.environmentIntensity = 0.3;
  environment.dispose();
  pmrem.dispose();
  const root = new THREE.Group();
  world.add(root);
  const geometries = {
    box: new RoundedBoxGeometry(1, 1, 1, 3, 0.085),
    sphere: new THREE.SphereGeometry(1, 28, 20),
    rod: new THREE.CylinderGeometry(1, 1, 1, 16),
  };
  const flameGeometry = new THREE.PlaneGeometry(2, 2);
  const flameMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { phase: { value: 0 } },
    vertexShader: `varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `precision mediump float;varying vec2 uv0;uniform float phase;void main(){float y=uv0.y;float x=(uv0.x-.5)*2.;x+=sin(y*7.-phase*18.)*.13*y;float width=pow(1.-y,.72)*.65;float mask=(1.-smoothstep(width,width+.12,abs(x)))*smoothstep(0.,.14,y)*(1.-smoothstep(.84,1.,y));float core=1.-smoothstep(0.,width,abs(x));vec3 color=mix(vec3(1.,.22,.025),vec3(1.,.91,.31),core*(1.-y*.6));gl_FragColor=vec4(color,mask*.92);}`,
  });
  const materialCache = new Map<string, THREE.MeshStandardMaterial>(),
    nodes: THREE.Mesh[] = [],
    decor = new THREE.Group();
  world.add(decor);
  const yAxis = new THREE.Vector3(0, 1, 0),
    direction = new THREE.Vector3();
  let last: GraphicsFrame | undefined,
    lastScene = "",
    disposed = false,
    queued = 0;
  function woodTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#C4A27D";
    ctx.fillRect(0, 0, 256, 256);
    let seed = 17;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 850; i++) {
      ctx.strokeStyle = `rgba(75,48,31,${random() * 0.13})`;
      ctx.beginPath();
      const x = random() * 256,
        y = random() * 256;
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + random() * 40,
        y + 1,
        x + random() * 80,
        y - 1,
        256,
        y + random() * 2,
      );
      ctx.stroke();
    }
    for (const y of [0, 64, 128, 192]) {
      ctx.fillStyle = "rgba(74,48,34,.23)";
      ctx.fillRect(0, y, 256, 1);
    }
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.anisotropy = 4;
    return texture;
  }
  const grain = woodTexture();
  const potGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.25, 20);
  const zipCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.73, 0.69),
    new THREE.Vector3(0, 0, 1.01),
    new THREE.Vector3(0, 0.73, 0.69),
  ]);
  const zipGeometry = new THREE.TubeGeometry(zipCurve, 16, 0.022, 6, false);
  const mouthGeometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, -0.3, 0.96),
      new THREE.Vector3(0, -0.32, 1.01),
      new THREE.Vector3(0.22, -0.3, 0.96),
    ]),
    10,
    0.012,
    6,
    false,
  );
  const clothCanvas = document.createElement("canvas");
  clothCanvas.width = clothCanvas.height = 64;
  const clothContext = clothCanvas.getContext("2d")!;
  clothContext.fillStyle = "#808080";
  clothContext.fillRect(0, 0, 64, 64);
  clothContext.fillStyle = "#969696";
  for (let x = 0; x < 64; x += 4) clothContext.fillRect(x, 0, 1, 64);
  for (let y = 0; y < 64; y += 4) clothContext.fillRect(0, y, 64, 1);
  const weave = new THREE.CanvasTexture(clothCanvas);
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(5, 5);

  function material(color: string, opacity: number, wood = false) {
    const alpha = Math.round(opacity * 20) / 20,
      key = color + alpha + wood;
    let m = materialCache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: color === "#AABAB9" ? 0.42 : 0.8,
        metalness: color === "#AABAB9" ? 0.35 : 0,
        transparent: alpha < 1,
        opacity: alpha,
        map: wood ? grain : null,
        bumpMap: ["#348F8B", "#55768A", "#344C64", "#E4A05F"].includes(color)
          ? weave
          : null,
        bumpScale: 0.006,
      });
      materialCache.set(key, m);
    }
    return m;
  }
  function place(mesh: THREE.Mesh, p: Primitive) {
    if (p.kind === "rod") {
      direction.set(p.b[0] - p.a[0], p.b[1] - p.a[1], p.b[2] - p.a[2]);
      mesh.position.set(
        (p.a[0] + p.b[0]) / 2,
        (p.a[1] + p.b[1]) / 2,
        (p.a[2] + p.b[2]) / 2,
      );
      mesh.scale.set(p.radius, direction.length(), p.radius);
      mesh.quaternion.setFromUnitVectors(yAxis, direction.normalize());
    } else {
      mesh.position.set(...p.center);
      mesh.rotation.set(0, p.yaw, 0);
      mesh.scale.set(...p.size);
    }
  }
  function plant() {
    decor.clear();
    const pot = new THREE.Mesh(potGeometry, material("#B78C69", 1));
    pot.position.set(-1.85, 0.125, -1.22);
    pot.castShadow = true;
    pot.receiveShadow = true;
    decor.add(pot);
    for (let i = 0; i < 9; i++) {
      const angle = (i * Math.PI * 2) / 9,
        leaf = new THREE.Mesh(
          geometries.sphere,
          material(i % 2 ? "#5B8870" : "#3F755D", 1),
        );
      leaf.scale.set(0.065, 0.26, 0.1);
      leaf.position.set(
        -1.85 + Math.cos(angle) * 0.12,
        0.43 + Math.sin(i * 2) * 0.06,
        -1.22 + Math.sin(angle) * 0.12,
      );
      leaf.rotation.set(Math.sin(angle) * 0.5, angle, Math.cos(angle) * 0.5);
      leaf.castShadow = true;
      decor.add(leaf);
    }
  }
  function details(mesh: THREE.Mesh, p: Primitive, color: string) {
    const part = p.part ?? "",
      old = mesh.userData.part;
    if (old === part) return;
    mesh.clear();
    mesh.userData.part = part;
    const add = (
      g: THREE.BufferGeometry,
      c: string,
      position: number[],
      scale: number[],
    ) => {
      const m = new THREE.Mesh(g, material(c, 1));
      m.position.set(position[0], position[1], position[2]);
      m.scale.set(scale[0], scale[1], scale[2]);
      mesh.add(m);
      return m;
    };
    if (part === "head" || part === "head-lying") {
      const face = new THREE.Group();
      mesh.add(face);
      if (part === "head-lying") face.rotation.x = -Math.PI / 2;
      const feature = (c: string, at: number[], scale: number[]) => {
        const m = add(geometries.sphere, c, at, scale);
        mesh.remove(m);
        face.add(m);
        return m;
      };
      for (const side of [-1, 1]) {
        feature("#FFF9EF", [side * 0.38, 0.12, 0.93], [0.17, 0.105, 0.06]);
        feature("#49392F", [side * 0.38, 0.12, 0.986], [0.075, 0.079, 0.028]);
        feature("#2D2926", [side * 0.38, 0.12, 1.013], [0.037, 0.047, 0.013]);
        feature("#6B5143", [side * 0.39, 0.3, 0.91], [0.2, 0.033, 0.025]);
        feature(color, [side * 0.99, -0.02, 0], [0.13, 0.21, 0.2]);
      }
      const mouth = new THREE.Mesh(mouthGeometry, material("#A27261", 1));
      face.add(mouth);
    }
    if (part === "torso") {
      add(zipGeometry, "#28534F", [0, 0, 0], [1, 1, 1]);
      for (const side of [-1, 1]) {
        add(
          geometries.box,
          color,
          [side * 0.55, -0.23, 0.82],
          [0.48, 0.29, 0.08],
        );
        add(
          geometries.box,
          "#497F79",
          [side * 0.55, -0.12, 0.87],
          [0.47, 0.025, 0.025],
        );
        const collar = add(
          geometries.box,
          color,
          [side * 0.27, 0.78, 0.54],
          [0.45, 0.27, 0.11],
        );
        collar.rotation.z = side * 0.45;
      }
    }
    if (part === "hand") {
      add(geometries.sphere, color, [0.8, -0.1, 0.2], [0.5, 0.55, 0.55]);
      for (const x of [-0.56, -0.19, 0.19, 0.56])
        add(geometries.sphere, color, [x, 0, 0.78], [0.19, 0.73, 0.48]);
    }
  }
  function forest() {
    decor.clear();
    const ground = new THREE.Mesh(geometries.box, material("#A2AD91", 1));
    ground.scale.set(30, 0.12, 30);
    ground.position.y = -0.18;
    ground.receiveShadow = true;
    decor.add(ground);
    for (const [i, x] of [-3.5, -2.7, 0.1, 2.9, 4].entries()) {
      const z = -2.7 - (i % 2) * 0.8,
        trunk = new THREE.Mesh(geometries.rod, material("#8B7054", 1));
      trunk.scale.set(0.09, 1.5, 0.09);
      trunk.position.set(x, 0.65, z);
      decor.add(trunk);
      for (let j = 0; j < 4; j++) {
        const crown = new THREE.Mesh(
          geometries.sphere,
          material(j % 2 ? "#5C805D" : "#74946B", 1),
        );
        crown.scale.set(0.56, 0.63, 0.55);
        crown.position.set(
          x + Math.cos(j * 1.6) * 0.28,
          1.65 + Math.sin(j * 2) * 0.18,
          z + Math.sin(j * 1.6) * 0.24,
        );
        decor.add(crown);
      }
    }
  }
  function update(data: GraphicsFrame) {
    last = data;
    const faces = buildScene(data.scene, data.frame, data.appearance),
      items: { p: Primitive; face: Face }[] = [],
      seen = new Set<Primitive>();
    for (const face of faces) {
      if (face.primitive && !seen.has(face.primitive)) {
        if (
          face.primitive.kind === "box" &&
          Math.abs(face.primitive.size[0] - 0.014) < 0.0001 &&
          face.color === "#3D3433"
        )
          continue;
        seen.add(face.primitive);
        items.push({ p: face.primitive, face });
      }
    }
    const themeKey =
      data.scene.id + "-" + data.scene.step + "-" + data.appearance;
    if (themeKey !== lastScene) {
      const outdoor = !faces.some(
        (face) =>
          face.layer === -2 &&
          face.primitive?.kind === "box" &&
          face.primitive.center[1] > 0.6 &&
          face.primitive.size[1] > 1,
      );
      if (outdoor) forest();
      else plant();
      lastScene = themeKey;
    }
    const atlas = data.appearance === "atlas";
    world.background = new THREE.Color(atlas ? "#E7DDC9" : "#CBDCD8");
    for (let i = 0; i < items.length; i++) {
      const { p, face } = items[i];
      let mesh = nodes[i];
      if (!mesh) {
        mesh = new THREE.Mesh();
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        nodes[i] = mesh;
        root.add(mesh);
      }
      mesh.geometry = p.part === "flame" ? flameGeometry : geometries[p.kind];
      mesh.userData.flame = p.part === "flame";
      const isFloor =
        p.kind === "box" && p.size[0] > 4 && p.size[1] < 0.3 && p.size[2] > 3;
      const wood =
        (isFloor && face.color !== "#B5C3A4") || face.color === "#B68D64";
      details(mesh, p, face.color);
      mesh.material =
        p.part === "flame"
          ? flameMaterial
          : material(
              isFloor && wood ? "#FAE7CC" : face.color,
              face.opacity ?? 1,
              wood,
            );
      mesh.castShadow = p.part !== "flame";
      place(mesh, p);
      mesh.visible = (face.opacity ?? 1) > 0.01;
      if ((face.layer ?? 0) === -2 && p.kind !== "rod") {
        if (p.center[0] < -2.5 && p.center[1] > 0.2 && data.yaw < -0.1)
          mesh.visible = false;
        if (p.center[2] < -1.5 && p.center[1] > 0.12 && data.yaw > 1.45)
          mesh.visible = false;
      }
    }
    for (let i = items.length; i < nodes.length; i++) nodes[i].visible = false;
    const clinical = ["adult-cpr", "bleeding"].includes(data.scene.kind),
      pitch = clinical ? 0.68 : 0.42,
      distance = (clinical ? 6.3 : 6.6) / data.zoom,
      target = new THREE.Vector3(
        clinical ? 0.1 : 0.1,
        clinical ? 0.54 : 0.85,
        clinical ? 0.14 : 0.05,
      );
    camera.position.set(
      target.x + Math.sin(data.yaw) * Math.cos(pitch) * distance,
      target.y + Math.sin(pitch) * distance,
      target.z + Math.cos(data.yaw) * Math.cos(pitch) * distance,
    );
    camera.lookAt(target);
    flameMaterial.uniforms.phase.value = data.frame;
    for (const node of nodes)
      if (node.userData.flame) node.quaternion.copy(camera.quaternion);
    renderer.render(world, camera);
    if (!painted) {
      painted = true;
      renderer.getContext().finish();
      requestAnimationFrame(() => {
        if (!disposed) emit("rendered");
      });
    }
    canvas.dataset.phase = String(data.frame);
    canvas.dataset.step = String(data.scene.step);
    canvas.dataset.scene = data.scene.id;
  }
  function resize() {
    if (disposed) return;
    const width = innerWidth || 300,
      height = innerHeight || 240;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (last) update(last);
  }
  function receive(event: MessageEvent) {
    if (!window.ReactNativeWebView && event.source !== parent) return;
    try {
      const data =
        typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      if (data?.channel !== "be-ready-graphics" || data.type !== "frame")
        return;
      const next = graphicsFrame(
        data.scene,
        data.frame,
        data.yaw,
        data.zoom,
        data.appearance === "atlas" ? "atlas" : "aurora",
      );
      last = next;
      if (!queued)
        queued = requestAnimationFrame(() => {
          queued = 0;
          if (!disposed && last)
            try {
              update(last);
            } catch {
              emit("error");
            }
        });
    } catch {
      emit("error");
    }
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(queued);
    removeEventListener("resize", resize);
    removeEventListener("message", receive);
    document.removeEventListener("message", receive as EventListener);
    for (const geometry of Object.values(geometries)) geometry.dispose();
    for (const m of materialCache.values()) m.dispose();
    flameMaterial.dispose();
    flameGeometry.dispose();
    grain.dispose();
    weave.dispose();
    potGeometry.dispose();
    zipGeometry.dispose();
    mouthGeometry.dispose();
    environmentMap.dispose();
    renderer.dispose();
  }
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    dispose();
    emit("error");
  });
  addEventListener("resize", resize);
  addEventListener("message", receive);
  document.addEventListener("message", receive as EventListener);
  addEventListener("pagehide", dispose, { once: true });
  resize();
  window.beReadyGraphics = { render: update, dispose };
  emit("ready");
} catch {
  emit("error");
}
