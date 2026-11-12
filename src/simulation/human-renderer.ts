/** Detailed CC0 MakeHuman responder, posed from the same authored scene controller.
 * No clock, network loader or animation loop is owned by this module.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import type { Vec3 } from "./geometry";
export type ActorPose =
  | "stand"
  | "walk"
  | "carry"
  | "reach"
  | "kneel"
  | "examine"
  | "pressure"
  | "cpr"
  | "lying"
  | "crouch"
  | "cover"
  | "phone";
export type ActorDescriptor = {
  position: Vec3;
  pose: ActorPose;
  phase: number;
  yaw: number;
  scale: number;
  shirt: string;
  skin: string;
  hands?: { left: Vec3; right: Vec3 };
};
export type HumanPool = {
  group: THREE.Group;
  update: (actors: ActorDescriptor[]) => void;
  dispose: () => void;
};
type Bind = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
  world: THREE.Vector3;
};
type HandFrame = { forward: THREE.Vector3; normal: THREE.Vector3 };
const Y = new THREE.Vector3(0, 1, 0),
  Z = new THREE.Vector3(0, 0, 1);
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clip = (t: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, Number.isFinite(t) ? t : min));
class Avatar {
  readonly group = new THREE.Group();
  private readonly posture = new THREE.Group();
  private readonly model: THREE.Object3D;
  private readonly bones = new Map<string, THREE.Bone>();
  private readonly binds = new Map<string, Bind>();
  private readonly axes = new Map<string, THREE.Vector3>();
  private readonly hands = new Map<string, HandFrame>();
  private readonly phone: THREE.Group;
  constructor(
    template: THREE.Object3D,
    phoneGeometry: THREE.BoxGeometry,
    phoneMaterial: THREE.Material,
    screenMaterial: THREE.Material,
  ) {
    this.model = cloneSkeleton(template);
    this.posture.add(this.model);
    this.group.add(this.posture);
    this.group.updateMatrixWorld(true);
    this.model.traverse((node) => {
      if ((node as THREE.Bone).isBone) {
        const bone = node as THREE.Bone;
        bone.name = bone.name.replace(/([^\.])([LR])$/, "$1.$2");
        this.bones.set(bone.name, bone);
        this.binds.set(bone.name, {
          position: bone.position.clone(),
          quaternion: bone.quaternion.clone(),
          scale: bone.scale.clone(),
          world: bone.getWorldPosition(new THREE.Vector3()),
        });
      }
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
      }
    });
    for (const side of ["L", "R"]) {
      this.rememberAxis("upperarm01." + side, "lowerarm01." + side);
      this.rememberAxis("lowerarm01." + side, "wrist." + side);
      this.rememberAxis("upperleg01." + side, "lowerleg01." + side);
      this.rememberAxis("lowerleg01." + side, "foot." + side);
      const wrist = this.bones.get("wrist." + side),
        middle = this.binds.get("finger3-1." + side),
        index = this.binds.get("finger2-1." + side),
        pinky = this.binds.get("finger5-1." + side);
      if (wrist && middle && index && pinky) {
        const center = this.binds.get(wrist.name)!.world,
          forward = middle.world.clone().sub(center).normalize(),
          across = index.world.clone().sub(pinky.world).normalize();
        const normal = new THREE.Vector3()
          .crossVectors(forward, across)
          .multiplyScalar(side === "L" ? 1 : -1)
          .normalize();
        const inverse = wrist
          .getWorldQuaternion(new THREE.Quaternion())
          .invert();
        this.hands.set(side, {
          forward: forward.applyQuaternion(inverse),
          normal: normal.applyQuaternion(inverse),
        });
      }
    }
    this.phone = new THREE.Group();
    const body = new THREE.Mesh(phoneGeometry, phoneMaterial);
    body.scale.set(0.068, 0.132, 0.014);
    const screen = new THREE.Mesh(phoneGeometry, screenMaterial);
    screen.scale.set(0.057, 0.108, 0.002);
    screen.position.z = 0.008;
    this.phone.add(body, screen);
    this.phone.visible = false;
    this.posture.add(this.phone);
  }
  private rememberAxis(start: string, end: string) {
    const bone = this.bones.get(start),
      target = this.binds.get(end);
    if (bone && target)
      this.axes.set(start, bone.worldToLocal(target.world.clone()).normalize());
  }
  private reset() {
    this.group.position.set(0, 0, 0);
    this.group.quaternion.identity();
    this.group.scale.setScalar(1);
    this.posture.position.set(0, 0, 0);
    this.posture.quaternion.identity();
    for (const [name, bone] of this.bones) {
      const bind = this.binds.get(name)!;
      bone.position.copy(bind.position);
      bone.quaternion.copy(bind.quaternion);
      bone.scale.copy(bind.scale);
    }
    this.group.updateMatrixWorld(true);
  }
  private point(name: string) {
    return (
      this.bones.get(name)?.getWorldPosition(new THREE.Vector3()) ??
      new THREE.Vector3()
    );
  }
  private aim(name: string, target: THREE.Vector3) {
    const bone = this.bones.get(name),
      axis = this.axes.get(name);
    if (!bone || !axis) return;
    const desired = target.clone().sub(this.point(name)).normalize(),
      parentQ =
        bone.parent?.getWorldQuaternion(new THREE.Quaternion()) ??
        new THREE.Quaternion();
    desired.applyQuaternion(parentQ.invert());
    bone.quaternion.setFromUnitVectors(axis, desired);
    bone.updateWorldMatrix(false, true);
  }
  private ik(
    upper: string,
    lower: string,
    end: string,
    target: THREE.Vector3,
    pole: THREE.Vector3,
  ) {
    if (
      !this.bones.has(upper) ||
      !this.bones.has(lower) ||
      !this.bones.has(end)
    )
      return;
    const a = this.binds.get(upper)!.world,
      b = this.binds.get(lower)!.world,
      c = this.binds.get(end)!.world;
    const length1 = a.distanceTo(b),
      length2 = b.distanceTo(c),
      start = this.point(upper),
      delta = target.clone().sub(start),
      requested = delta.length();
    if (requested < 1e-5 || length1 < 1e-5 || length2 < 1e-5) return;
    const distance = clip(
        requested,
        Math.abs(length1 - length2) + 0.002,
        length1 + length2 - 0.002,
      ),
      direction = delta.normalize();
    const along =
        (length1 * length1 - length2 * length2 + distance * distance) /
        (2 * distance),
      height = Math.sqrt(Math.max(0, length1 * length1 - along * along));
    const bend = pole.clone().sub(start);
    bend.addScaledVector(direction, -bend.dot(direction));
    if (bend.lengthSq() < 1e-8)
      bend.copy(Z).addScaledVector(direction, -direction.z);
    bend.normalize();
    const elbow = start
        .clone()
        .addScaledVector(direction, along)
        .addScaledVector(bend, height),
      reachable = start.clone().addScaledVector(direction, distance);
    this.aim(upper, elbow);
    this.aim(lower, reachable);
  }
  private worldRotation(name: string, rotation: THREE.Quaternion) {
    const bone = this.bones.get(name);
    if (!bone) return;
    const parent =
      bone.parent?.getWorldQuaternion(new THREE.Quaternion()) ??
      new THREE.Quaternion();
    bone.quaternion.copy(parent.invert().multiply(rotation));
    bone.updateWorldMatrix(false, true);
  }
  private hand(side: string, forward: THREE.Vector3, normal: THREE.Vector3) {
    const frame = this.hands.get(side),
      bone = this.bones.get("wrist." + side);
    if (!frame || !bone) return;
    const inv = (
        bone.parent?.getWorldQuaternion(new THREE.Quaternion()) ??
        new THREE.Quaternion()
      ).invert(),
      f = forward.clone().normalize().applyQuaternion(inv),
      n = normal.clone().normalize().applyQuaternion(inv);
    const aim = new THREE.Quaternion().setFromUnitVectors(frame.forward, f),
      current = frame.normal.clone().applyQuaternion(aim);
    current.addScaledVector(f, -current.dot(f)).normalize();
    n.addScaledVector(f, -n.dot(f)).normalize();
    const angle = Math.atan2(
      f.dot(new THREE.Vector3().crossVectors(current, n)),
      clip(current.dot(n), -1, 1),
    );
    bone.quaternion.copy(
      new THREE.Quaternion().setFromAxisAngle(f, angle).multiply(aim),
    );
    bone.updateWorldMatrix(false, true);
  }
  private curl(side: string, amount: number) {
    const frame = this.hands.get(side);
    if (!frame || amount === 0) return;
    for (let finger = 2; finger <= 5; finger++)
      for (let segment = 1; segment <= 3; segment++) {
        const name = `finger${finger}-${segment}.${side}`,
          bone = this.bones.get(name);
        if (!bone) continue;
        const next = this.binds.get(
            `finger${finger}-${Math.min(3, segment + 1)}.${side}`,
          ),
          at = this.binds.get(name)!;
        const direction =
          next && next !== at
            ? next.world.clone().sub(at.world).normalize()
            : this.binds
                .get(`finger${finger}-3.${side}`)!
                .world.clone()
                .sub(this.binds.get(`finger${finger}-2.${side}`)!.world)
                .normalize();
        const axis = new THREE.Vector3()
          .crossVectors(direction, frame.normal)
          .normalize();
        bone.quaternion.multiply(
          new THREE.Quaternion().setFromAxisAngle(
            axis,
            amount * (segment === 1 ? 0.45 : 1),
          ),
        );
      }
  }
  update(actor: ActorDescriptor) {
    this.reset();
    const t = clip(actor.phase),
      pose = actor.pose,
      lying = pose === "lying",
      cycle = t * Math.PI * 6;
    const folded = ["kneel", "examine", "pressure", "cpr"].includes(pose),
      crouch = pose === "crouch" || pose === "cover";
    const root = this.bones.get("root");
    let pelvis = 0.9434,
      advance = 0,
      lean = 0;
    if (folded) {
      pelvis = pose === "cpr" ? 0.5 : pose === "pressure" ? 0.43 : 0.6;
      advance = pose === "cpr" || pose === "pressure" ? 0.18 : 0.02;
      lean =
        pose === "cpr"
          ? 0.96
          : pose === "pressure"
            ? 1.08
            : pose === "examine"
              ? 0.55
              : pose === "kneel"
                ? 0.4
                : 0.12;
    }
    if (crouch) {
      pelvis = 0.66;
      advance = 0.04;
      lean = 0.7;
    }
    if (pose === "reach" || pose === "carry") {
      lean = 0.3;
      pelvis = 0.928;
    }
    const press = pose === "cpr" ? Math.sin(t * Math.PI * 4) ** 2 * 0.027 : 0;
    if (root) {
      root.position.y += pelvis - 0.9434 - press;
      root.position.z += advance;
      if (pose === "walk" || pose === "carry")
        root.position.y += Math.sin(cycle * 2) ** 2 * 0.008;
    }
    const spine = this.bones.get("spine05") ?? this.bones.get("spine04");
    if (spine)
      spine.quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          lean,
        ),
      );
    if (pose === "walk") {
      const s = this.bones.get("spine03");
      s?.quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(Y, Math.sin(cycle) * 0.035),
      );
    }
    this.group.updateMatrixWorld(true);
    for (const side of ["L", "R"]) {
      const sign = side === "L" ? 1 : -1,
        stride =
          pose === "walk" || pose === "carry"
            ? Math.sin(cycle + (sign < 0 ? Math.PI : 0)) * 0.15
            : 0;
      const foot = folded
        ? v(sign * 0.135, 0.078, -0.22)
        : v(sign * 0.135, 0.078 + Math.max(0, stride) * 0.28, stride + 0.025);
      const knee = folded
        ? v(sign * 0.16, 0.13, 0.26)
        : v(sign * 0.18, 0.45, crouch ? 0.75 : 0.3);
      this.ik(
        "upperleg01." + side,
        "lowerleg01." + side,
        "foot." + side,
        foot,
        knee,
      );
      this.worldRotation(
        "foot." + side,
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          folded ? Math.PI : 0,
        ),
      );
    }
    // Arms are solved after the spine and legs, so contact points stay anchored in the scene.
    const contact = (point: Vec3) =>
      new THREE.Vector3(...point)
        .sub(new THREE.Vector3(...actor.position))
        .applyAxisAngle(Y, -actor.yaw)
        .divideScalar(Math.max(0.001, actor.scale));
    for (const side of ["L", "R"]) {
      const sign = side === "L" ? 1 : -1,
        shoulder = this.point("upperarm01." + side);
      let target = v(sign * 0.27, 0.98, 0.035),
        pole = v(sign * 0.5, 1.13, 0.12),
        direction = v(0, -1, 0.05),
        normal = v(-sign, 0, 0);
      if (pose === "walk") {
        target.z -= Math.sin(cycle + (sign < 0 ? Math.PI : 0)) * 0.1;
        target.y += 0.015;
      }
      if (["reach", "carry", "examine", "pressure", "cpr"].includes(pose)) {
        const low = pose === "cpr" || pose === "pressure";
        target = v(
          low
            ? (pose === "cpr" ? 0 : 0.13) + (sign > 0 ? -0.006 : 0.006)
            : sign * 0.14,
          low ? 0.35 - press + (sign < 0 ? 0.018 : 0) : folded ? 0.62 : 1.085,
          low ? 0.69 : 0.47,
        );
        pole = shoulder.clone().add(v(sign * 0.24, -0.18, 0.12));
        direction = v(0, 0, 1);
        normal = v(0, -1, 0);
      }
      if (pose === "kneel") {
        target = v(sign * 0.14, 0.67, 0.32);
        pole = shoulder.clone().add(v(sign * 0.24, -0.18, 0.12));
        direction = v(0, 0, 1);
        normal = v(0, -1, 0);
      }
      if (pose === "cover") {
        const head = this.point("head");
        target = head.clone().add(v(sign * 0.075, 0.14, 0.02));
        pole = head.clone().add(v(sign * 0.3, -0.19, 0.21));
        direction = v(-sign, 0, 0);
        normal = v(0, -1, 0);
      }
      if (pose === "phone" && side === "R") {
        target = this.point("head").add(v(-0.13, 0.02, 0.095));
        pole = v(-0.4, 1.14, 0.15);
        direction = v(0, 1, 0);
        normal = v(1, 0, 0);
      }
      const override = side === "L" ? actor.hands?.left : actor.hands?.right;
      if (override) target = contact(override);
      this.ik(
        "upperarm01." + side,
        "lowerarm01." + side,
        "wrist." + side,
        target,
        pole,
      );
      this.hand(side, direction, normal);
      this.curl(
        side,
        pose === "carry" ? 0.25 : pose === "phone" && side === "R" ? 0.65 : 0,
      );
    }
    this.phone.visible = pose === "phone";
    if (this.phone.visible) {
      const at = this.point("wrist.R");
      this.phone.position.copy(at).add(v(-0.012, 0.025, 0.02));
      this.phone.rotation.set(0, -0.25, 0.1);
    }
    if (lying) {
      // Pose the legs and arms parallel on a firm surface, then turn the whole body face-up.
      for (const side of ["L", "R"]) {
        const sign = side === "L" ? 1 : -1;
        this.ik(
          "upperleg01." + side,
          "lowerleg01." + side,
          "foot." + side,
          v(sign * 0.14, 0.078, 0.025),
          v(sign * 0.16, 0.45, 0.1),
        );
        this.worldRotation("foot." + side, new THREE.Quaternion());
        this.ik(
          "upperarm01." + side,
          "lowerarm01." + side,
          "wrist." + side,
          v(sign * 0.34, 1.02, 0.015),
          v(sign * 0.45, 1.24, 0.05),
        );
        this.hand(side, v(0, -1, 0), v(0, 0, 1));
      }
      this.posture.rotation.x = -Math.PI / 2;
      this.posture.position.set(0, 0.155, 0.9);
    }
    this.group.position.set(...actor.position);
    this.group.rotation.y = actor.yaw;
    this.group.scale.setScalar(clip(actor.scale, 0.1, 2));
    this.group.visible = true;
    this.group.updateMatrixWorld(true);
  }
}
export async function loadHumanAsset(base64: string): Promise<HumanPool> {
  const binary = atob(base64),
    buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  const asset = await new GLTFLoader().parseAsync(buffer.buffer, "");
  asset.scene.updateMatrixWorld(true);
  const geometry = new THREE.BoxGeometry(1, 1, 1),
    phoneMaterial = new THREE.MeshStandardMaterial({
      color: "#182C36",
      roughness: 0.45,
    }),
    screenMaterial = new THREE.MeshStandardMaterial({
      color: "#9DC9D6",
      emissive: "#376979",
      emissiveIntensity: 0.12,
      roughness: 0.45,
    });
  const group = new THREE.Group(),
    instances: Avatar[] = [];
  let disposed = false;
  asset.scene.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const m of materials) {
        if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
          const standard = m as THREE.MeshStandardMaterial;
          standard.roughness = /eyes/i.test(standard.name)
            ? 0.34
            : /skin/i.test(standard.name)
              ? 0.72
              : 0.9;
          standard.metalness = 0;
        }
      }
    }
  });
  return {
    group,
    update(actors) {
      if (disposed) return;
      for (let i = 0; i < actors.length; i++) {
        if (!instances[i]) {
          instances[i] = new Avatar(
            asset.scene,
            geometry,
            phoneMaterial,
            screenMaterial,
          );
          group.add(instances[i].group);
        }
        instances[i].update(actors[i]);
      }
      for (let i = actors.length; i < instances.length; i++)
        instances[i].group.visible = false;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>(),
        textures = new Set<THREE.Texture>(),
        skeletons = new Set<THREE.Skeleton>();
      for (const root of [asset.scene, ...instances.map((a) => a.group)])
        root.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (mesh.isMesh) {
            geometries.add(mesh.geometry);
            for (const material of Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material]) {
              materials.add(material);
              for (const value of Object.values(material))
                if (
                  value &&
                  typeof value === "object" &&
                  (value as THREE.Texture).isTexture
                )
                  textures.add(value as THREE.Texture);
            }
            if ((mesh as THREE.SkinnedMesh).isSkinnedMesh)
              skeletons.add((mesh as THREE.SkinnedMesh).skeleton);
          }
        });
      for (const s of skeletons) s.dispose();
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
      geometry.dispose();
      phoneMaterial.dispose();
      screenMaterial.dispose();
      group.clear();
    },
  };
}
