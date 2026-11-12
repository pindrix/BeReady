/** Art-directed, local environment detail. No network assets, timers or independent animation. */
import * as THREE from "three";

export type SetDressing = { group: THREE.Group; dispose: () => void };

type Tracked = THREE.BufferGeometry | THREE.Material | THREE.Texture;

/** Deterministic dressing keeps pauses, camera changes and repeated screenshots stable. */
export function createSetDressing(
  outdoors: boolean,
  appearance: "aurora" | "atlas",
): SetDressing {
  const group = new THREE.Group(),
    resources = new Set<Tracked>(),
    instanceMeshes: THREE.InstancedMesh[] = [],
    transform = new THREE.Object3D(),
    axis = new THREE.Vector3(0, 1, 0),
    direction = new THREE.Vector3();
  let seed = outdoors ? 72031 : 1827;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const own = <T extends Tracked>(resource: T): T => {
    resources.add(resource);
    return resource;
  };
  const canvasTexture = (
    width: number,
    height: number,
    draw: (context: CanvasRenderingContext2D) => void,
  ) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d")!;
    draw(context);
    const texture = own(new THREE.CanvasTexture(canvas));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  };
  const material = (color: string, roughness = 0.85) =>
    own(new THREE.MeshStandardMaterial({ color, roughness }));
  const box = own(new THREE.BoxGeometry(1, 1, 1)),
    stem = own(new THREE.CylinderGeometry(0.68, 1, 1, 9));
  const mesh = (
    geometry: THREE.BufferGeometry,
    finish: THREE.Material,
    at: [number, number, number],
    size: [number, number, number] = [1, 1, 1],
  ) => {
    const object = new THREE.Mesh(geometry, finish);
    object.position.set(...at);
    object.scale.set(...size);
    object.receiveShadow = true;
    group.add(object);
    return object;
  };
  const instances = (
    geometry: THREE.BufferGeometry,
    finish: THREE.Material,
    count: number,
    make: (index: number, object: THREE.Object3D) => THREE.Color | undefined,
    castShadow = false,
  ) => {
    const instanced = new THREE.InstancedMesh(geometry, finish, count);
    instanceMeshes.push(instanced);
    for (let i = 0; i < count; i++) {
      transform.position.set(0, 0, 0);
      transform.rotation.set(0, 0, 0);
      transform.scale.set(1, 1, 1);
      const color = make(i, transform);
      transform.updateMatrix();
      instanced.setMatrixAt(i, transform.matrix);
      if (color) instanced.setColorAt(i, color);
    }
    instanced.castShadow = castShadow;
    instanced.receiveShadow = true;
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
    instanced.computeBoundingSphere();
    group.add(instanced);
    return instanced;
  };
  const fitBranch = (
    object: THREE.Object3D,
    start: THREE.Vector3,
    end: THREE.Vector3,
    radius: number,
  ) => {
    direction.subVectors(end, start);
    object.position.copy(start).add(end).multiplyScalar(0.5);
    object.scale.set(radius, direction.length(), radius);
    object.quaternion.setFromUnitVectors(axis, direction.normalize());
  };

  const leafMap = canvasTexture(128, 256, (context) => {
    // An alpha-cut leaf is considerably lighter than a solid ellipsoid crown.
    const fill = context.createLinearGradient(0, 0, 128, 180);
    fill.addColorStop(0, "#92AA73");
    fill.addColorStop(0.48, "#6D8B55");
    fill.addColorStop(1, "#36533D");
    context.fillStyle = fill;
    context.beginPath();
    context.moveTo(64, 8);
    context.bezierCurveTo(112, 45, 124, 142, 64, 249);
    context.bezierCurveTo(4, 142, 16, 45, 64, 8);
    context.fill();
    context.lineWidth = 1.6;
    context.strokeStyle = "rgba(204,216,143,.48)";
    context.beginPath();
    context.moveTo(64, 20);
    context.lineTo(64, 242);
    context.stroke();
    context.lineWidth = 0.8;
    for (let y = 58; y < 226; y += 24) {
      for (const side of [-1, 1]) {
        context.beginPath();
        context.moveTo(64, y + 18);
        context.lineTo(64 + side * (38 - Math.abs(y - 120) * 0.13), y - 12);
        context.stroke();
      }
    }
  });
  const leaf = own(new THREE.PlaneGeometry(1, 1, 1, 2));
  // Curve the blade in depth, so nearby plant leaves catch changing light.
  const leafPositions = leaf.getAttribute("position");
  for (let i = 0; i < leafPositions.count; i++) {
    const y = leafPositions.getY(i),
      x = leafPositions.getX(i);
    leafPositions.setZ(i, Math.sin((y + 0.5) * Math.PI) * 0.1 - x * x * 0.13);
  }
  leaf.computeVertexNormals();
  const foliage = own(
    new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      map: leafMap,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      roughness: 0.88,
      metalness: 0,
    }),
  );

  if (outdoors) {
    const earthMap = canvasTexture(256, 256, (context) => {
      context.fillStyle = appearance === "atlas" ? "#8D886D" : "#81846B";
      context.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 4400; i++) {
        const value = 72 + Math.floor(random() * 60);
        context.fillStyle = `rgba(${value + 19},${value + 12},${value - 7},${0.1 + random() * 0.2})`;
        context.fillRect(random() * 256, random() * 256, 1 + random() * 3, 1);
      }
      for (let i = 0; i < 200; i++) {
        context.strokeStyle =
          i % 3 ? "rgba(63,67,40,.14)" : "rgba(187,164,116,.2)";
        const x = random() * 256,
          y = random() * 256;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + random() * 9 - 4, y + random() * 7 - 3);
        context.stroke();
      }
    });
    earthMap.wrapS = earthMap.wrapT = THREE.RepeatWrapping;
    earthMap.repeat.set(18, 18);
    const earth = own(
      new THREE.MeshStandardMaterial({
        color: "#E5DEC6",
        map: earthMap,
        bumpMap: earthMap,
        bumpScale: 0.016,
        roughness: 1,
      }),
    );
    // Just above the old schematic ground: continuous earth hides its rectangular board.
    const terrain = mesh(
      own(new THREE.PlaneGeometry(30, 30)),
      earth,
      [0, 0.012, 0],
    );
    terrain.rotation.x = -Math.PI / 2;

    const clearingMap = canvasTexture(256, 256, (context) => {
      const wash = context.createRadialGradient(128, 128, 32, 128, 128, 125);
      wash.addColorStop(0, "rgba(186,168,132,.72)");
      wash.addColorStop(0.65, "rgba(169,155,119,.43)");
      wash.addColorStop(1, "rgba(164,155,123,0)");
      context.fillStyle = wash;
      context.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1100; i++) {
        const x = random() * 256,
          y = random() * 256,
          radius = Math.hypot(x - 128, y - 128) / 128;
        if (radius > 0.94) continue;
        context.fillStyle = `rgba(90,73,49,${(1 - radius) * random() * 0.14})`;
        context.fillRect(x, y, 1 + random() * 3, 1);
      }
    });
    const clearing = mesh(
      own(new THREE.PlaneGeometry(6.2, 5.1)),
      own(
        new THREE.MeshStandardMaterial({
          map: clearingMap,
          transparent: true,
          depthWrite: false,
          roughness: 1,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        }),
      ),
      [0, 0.014, 0.1],
    );
    clearing.rotation.x = -Math.PI / 2;

    const barkMap = canvasTexture(128, 256, (context) => {
      context.fillStyle = "#7E7160";
      context.fillRect(0, 0, 128, 256);
      for (let i = 0; i < 550; i++) {
        context.strokeStyle =
          i % 2 ? "rgba(40,37,31,.24)" : "rgba(186,168,135,.18)";
        const x = random() * 128,
          y = random() * 256;
        context.lineWidth = 0.3 + random() * 1.2;
        context.beginPath();
        context.moveTo(x, y);
        context.bezierCurveTo(
          x - 2,
          y + 8,
          x + 2,
          y + 18,
          x + random() * 3,
          y + 20 + random() * 34,
        );
        context.stroke();
      }
    });
    barkMap.wrapS = barkMap.wrapT = THREE.RepeatWrapping;
    barkMap.repeat.set(1, 2);
    const bark = own(
      new THREE.MeshStandardMaterial({
        color: "#D3C6AD",
        map: barkMap,
        bumpMap: barkMap,
        bumpScale: 0.018,
        roughness: 1,
      }),
    );
    const trees = [
      [-4.4, -3.9, 3.5],
      [-2.9, -4.5, 3.2],
      [-0.4, -5.3, 3.9],
      [2.6, -4.1, 3.4],
      [4.1, -3.1, 3.6],
    ];
    const branches: {
        from: THREE.Vector3;
        to: THREE.Vector3;
        radius: number;
      }[] = [],
      crowns: THREE.Vector3[] = [];
    for (const [x, z, height] of trees) {
      const base = new THREE.Vector3(x, 0.01, z),
        fork = new THREE.Vector3(x + 0.07, height * 0.49, z - 0.08);
      branches.push({ from: base, to: fork, radius: 0.105 + random() * 0.025 });
      for (let j = 0; j < 5; j++) {
        const angle = j * 2.399 + random() * 0.4,
          top = new THREE.Vector3(
            x + Math.cos(angle) * (0.45 + random() * 0.4),
            height * (0.56 + random() * 0.4),
            z + Math.sin(angle) * (0.45 + random() * 0.35),
          );
        branches.push({
          from: fork.clone().lerp(base, 0.05 + random() * 0.12),
          to: top,
          radius: 0.032 + random() * 0.017,
        });
        crowns.push(top);
      }
    }
    instances(
      stem,
      bark,
      branches.length,
      (i, object) => {
        const branch = branches[i];
        fitBranch(object, branch.from, branch.to, branch.radius);
        return undefined;
      },
      true,
    );
    instances(
      leaf,
      foliage,
      crowns.length * 40,
      (i, object) => {
        const center = crowns[Math.floor(i / 40)],
          angle = random() * Math.PI * 2,
          distance = Math.sqrt(random()) * 0.72;
        object.position.set(
          center.x + Math.cos(angle) * distance,
          center.y + (random() - 0.5) * 0.65,
          center.z + Math.sin(angle) * distance,
        );
        object.rotation.set(
          (random() - 0.5) * 2.4,
          random() * Math.PI * 2,
          (random() - 0.5) * 1.5,
        );
        const size = 0.18 + random() * 0.13;
        object.scale.set(size * 0.55, size, 1);
        return new THREE.Color().setHSL(
          0.23 + random() * 0.055,
          0.2 + random() * 0.16,
          0.7 + random() * 0.18,
        );
      },
      true,
    );

    // Peripheral grasses break the flat edge without filling the instructional action area.
    const grass = own(new THREE.PlaneGeometry(1, 1));
    instances(grass, material("#7C8D61"), 260, (_i, object) => {
      const side = random() > 0.5 ? 1 : -1;
      object.position.set(
        side * (2.4 + random() * 2),
        0.045 + random() * 0.05,
        -2.2 + random() * 4.1,
      );
      object.scale.set(0.012 + random() * 0.015, 0.075 + random() * 0.16, 1);
      object.rotation.set(
        -0.12 - random() * 0.3,
        random() * Math.PI * 2,
        (random() - 0.5) * 0.7,
      );
      return new THREE.Color().setHSL(
        0.22 + random() * 0.06,
        0.23,
        0.6 + random() * 0.2,
      );
    });
    const stone = own(new THREE.DodecahedronGeometry(1, 0));
    instances(stone, material("#91968A"), 14, (_i, object) => {
      const side = random() > 0.5 ? 1 : -1,
        size = 0.035 + random() * 0.065;
      object.position.set(
        side * (2.4 + random() * 1.6),
        size * 0.3,
        -1.9 + random() * 3.8,
      );
      object.scale.set(size * 1.2, size * 0.65, size);
      object.rotation.set(random(), random() * 4, random());
      return new THREE.Color().setHSL(0.14, 0.05, 0.65 + random() * 0.2);
    });
  } else {
    const atlas = appearance === "atlas",
      oak = material(atlas ? "#AC8961" : "#B79670"),
      ink = material("#4D5954"),
      linen = material(atlas ? "#D6C5A7" : "#D8D7C7");
    // A slim back-wall console and book spines add scale without crowding the action.
    mesh(box, oak, [-1.19, 0.71, -1.58], [1.05, 0.055, 0.27]).castShadow = true;
    mesh(box, ink, [-1.58, 0.56, -1.64], [0.035, 0.3, 0.15]);
    mesh(box, ink, [-0.81, 0.56, -1.64], [0.035, 0.3, 0.15]);
    instances(
      box,
      material("#FFFFFF"),
      5,
      (i, object) => {
        const heights = [0.19, 0.23, 0.2, 0.25, 0.21],
          colors = ["#A1947F", "#657E78", "#C3AC84", "#7F8A91", "#B6BAA7"];
        object.position.set(-1.48 + i * 0.073, 0.745 + heights[i] / 2, -1.59);
        object.scale.set(0.057, heights[i], 0.135);
        object.rotation.z = i === 4 ? -0.12 : 0;
        return new THREE.Color(colors[i]);
      },
      true,
    );

    const landscape = canvasTexture(256, 160, (context) => {
      const sky = context.createLinearGradient(0, 0, 0, 160);
      sky.addColorStop(0, "#B5CBC7");
      sky.addColorStop(1, "#EAE0C6");
      context.fillStyle = sky;
      context.fillRect(0, 0, 256, 160);
      context.fillStyle = "#DDD1AF";
      context.beginPath();
      context.arc(185, 49, 17, 0, Math.PI * 2);
      context.fill();
      for (const [color, y, amplitude] of [
        ["#899E9B", 95, 33],
        ["#647F7E", 121, 29],
        ["#3F6261", 156, 27],
      ] as const) {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(0, 160);
        for (let x = 0; x <= 256; x += 12)
          context.lineTo(
            x,
            y +
              Math.sin(x * 0.027 + amplitude) * amplitude * 0.42 +
              Math.cos(x * 0.061) * 6,
          );
        context.lineTo(256, 160);
        context.fill();
      }
    });
    const art = material("#FFFFFF");
    art.map = landscape;
    mesh(box, oak, [-1.24, 1.43, -1.72], [0.98, 0.65, 0.036]).castShadow = true;
    mesh(own(new THREE.PlaneGeometry(0.9, 0.57)), art, [-1.24, 1.43, -1.696]);
    // Pleated curtain geometry has real highlights; it is not a flat coloured stripe.
    const curtain = own(new THREE.PlaneGeometry(0.31, 1.31, 18, 1)),
      curtainPosition = curtain.getAttribute("position");
    for (let i = 0; i < curtainPosition.count; i++)
      curtainPosition.setZ(i, Math.sin(curtainPosition.getX(i) * 95) * 0.019);
    curtain.computeVertexNormals();
    const curtainMaterial = own(
      new THREE.MeshStandardMaterial({
        color: atlas ? "#DFD1B6" : "#D7DCD1",
        side: THREE.DoubleSide,
        roughness: 0.98,
      }),
    );
    mesh(curtain, curtainMaterial, [0.57, 1.31, -1.55]);
    mesh(curtain, curtainMaterial, [2.12, 1.31, -1.55]);
    const rail = mesh(stem, ink, [1.34, 2.0, -1.54], [0.018, 1.97, 0.018]);
    rail.rotation.z = Math.PI / 2;
    instances(box, oak, 9, (i, object) => {
      object.position.set(-2.51, 0.71, -1.17 + i * 0.09);
      object.scale.set(0.027, 1.29, 0.026);
      return undefined;
    });

    const pot = own(new THREE.CylinderGeometry(0.19, 0.145, 0.33, 24)),
      clay = material(atlas ? "#B0886A" : "#AC8D74"),
      base = new THREE.Vector3(-1.98, 0.33, -0.99);
    mesh(pot, clay, [-1.98, 0.175, -0.99]).castShadow = true;
    mesh(
      own(new THREE.CircleGeometry(0.172, 20)),
      material("#625344"),
      [-1.98, 0.341, -0.99],
    ).rotation.x = -Math.PI / 2;
    const branchEnds: THREE.Vector3[] = [];
    const plantBranches: {
      from: THREE.Vector3;
      to: THREE.Vector3;
      radius: number;
    }[] = [
      { from: base, to: new THREE.Vector3(-1.96, 1.35, -1.01), radius: 0.014 },
    ];
    for (let i = 0; i < 18; i++) {
      const angle = i * 2.399,
        y = 0.48 + i * 0.042,
        start = new THREE.Vector3(-1.97, y, -1),
        end = new THREE.Vector3(
          -1.97 + Math.cos(angle) * (0.15 + random() * 0.18),
          y + 0.16,
          -1 + Math.sin(angle) * (0.16 + random() * 0.17),
        );
      plantBranches.push({ from: start, to: end, radius: 0.005 });
      branchEnds.push(end);
    }
    instances(
      stem,
      material("#607457"),
      plantBranches.length,
      (i, object) => {
        const branch = plantBranches[i];
        fitBranch(object, branch.from, branch.to, branch.radius);
        return undefined;
      },
      true,
    );
    instances(
      leaf,
      foliage,
      branchEnds.length,
      (i, object) => {
        object.position.copy(branchEnds[i]);
        const away = object.position.clone().sub(base).setY(0.35).normalize();
        object.quaternion.setFromUnitVectors(axis, away);
        object.rotateY(i * 0.53);
        object.scale.set(0.21 + random() * 0.08, 0.33 + random() * 0.09, 1);
        return new THREE.Color().setHSL(
          0.26 + random() * 0.045,
          0.16 + random() * 0.08,
          0.72 + random() * 0.2,
        );
      },
      true,
    );
    // Small linen panels add a material cue even at the camera's overview distance.
    mesh(box, linen, [-0.87, 0.77, -1.6], [0.14, 0.015, 0.15]);
  }

  let disposed = false;
  return {
    group,
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      group.clear();
      for (const instanced of instanceMeshes) instanced.dispose();
      instanceMeshes.length = 0;
      for (const resource of resources) resource.dispose();
      resources.clear();
    },
  };
}
