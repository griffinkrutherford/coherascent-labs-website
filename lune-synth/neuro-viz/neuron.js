import * as THREE from "../vendor/three/three.module.js";

// One neuron: soma, a branching dendritic tree, a myelinated axon, and
// terminal boutons.
//
// Both neurons in the scene are built from this same function with identical
// geometry. The only thing that differs is what practice built — sheath
// thickness, node regularity, and how the action potential propagates.
// Nothing about the unbuilt neuron is damaged or degraded; it is simply
// unbuilt.

export const AXON_START = -2.0;
export const AXON_END = 2.0;
const SEG_COUNT = 9;
const GAP = 0.13;
const SPAN = AXON_END - AXON_START;
const SEG_LEN = (SPAN - GAP * (SEG_COUNT - 1)) / SEG_COUNT;
const SOMA_X = -2.36;

export const SEGMENT_CENTERS = Array.from(
  { length: SEG_COUNT },
  (_, i) => AXON_START + SEG_LEN / 2 + i * (SEG_LEN + GAP),
);

// Nodes of Ranvier — the exposed gaps between internodes. These are the
// points a saltatory action potential jumps between.
export const NODE_POSITIONS = [
  AXON_START,
  ...Array.from(
    { length: SEG_COUNT - 1 },
    (_, i) => AXON_START + (i + 1) * (SEG_LEN + GAP) - GAP / 2,
  ),
  AXON_END,
];

const PALETTE = {
  dark: {
    soma: 0x93a3bf,
    axon: 0x6b7791,
    earned: 0x64a8ff,
    earnedEmissive: 0x1b3d6b,
    unbuilt: 0x8b97ad,
    unbuiltEmissive: 0x1b2436,
    pulseEarned: 0xdcefff,
    pulseUnbuilt: 0x7fb0e8,
  },
  light: {
    soma: 0x7d8899,
    axon: 0x94a0b5,
    earned: 0x4f84d6,
    earnedEmissive: 0x2a4f8f,
    unbuilt: 0x9aa5b8,
    unbuiltEmissive: 0x5a6478,
    pulseEarned: 0x1f5fc4,
    pulseUnbuilt: 0x5f8ec8,
  },
};

// Local merge so dendrites and terminals each cost one draw call, without
// pulling in the BufferGeometryUtils addon.
function mergeGeoms(geoms) {
  const flat = geoms.map((g) => (g.index ? g.toNonIndexed() : g));
  const keys = ["position", "normal", "uv"];
  const total = flat.reduce((n, g) => n + g.attributes.position.count, 0);
  const out = new THREE.BufferGeometry();
  for (const k of keys) {
    if (!flat[0].attributes[k]) continue;
    const size = flat[0].attributes[k].itemSize;
    const arr = new Float32Array(total * size);
    let o = 0;
    for (const g of flat) {
      arr.set(g.attributes[k].array, o);
      o += g.attributes[k].array.length;
    }
    out.setAttribute(k, new THREE.BufferAttribute(arr, size));
  }
  for (const g of flat) g.dispose();
  return out;
}

let GLOW_TEXTURE = null;
function glowTexture() {
  if (GLOW_TEXTURE) return GLOW_TEXTURE;
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.42)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  GLOW_TEXTURE = new THREE.CanvasTexture(c);
  GLOW_TEXTURE.colorSpace = THREE.SRGBColorSpace;
  return GLOW_TEXTURE;
}

// Tapered tube. TubeGeometry only does constant radius, which is what made
// the dendrites read as straight rods rather than as biological processes:
// real dendrites and axon collaterals narrow as they branch.
function taperedTube(points, r0, r1, radial = 8, segments = 18) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const frames = curve.computeFrenetFrames(segments, false);
  const pos = [];
  const nor = [];
  const uv = [];
  const P = new THREE.Vector3();
  const V = new THREE.Vector3();

  const ring = (i) => {
    const t = i / segments;
    curve.getPoint(t, P);
    // Ease the taper so the branch thins toward the tip rather than linearly.
    const r = r0 + (r1 - r0) * (t * t * (3 - 2 * t));
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const out = [];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const sin = Math.sin(a);
      const cos = Math.cos(a);
      V.set(N.x * cos + B.x * sin, N.y * cos + B.y * sin, N.z * cos + B.z * sin);
      out.push({
        p: [P.x + V.x * r, P.y + V.y * r, P.z + V.z * r],
        n: [V.x, V.y, V.z],
        u: j / radial,
        v: t,
      });
    }
    return out;
  };

  let prev = ring(0);
  for (let i = 1; i <= segments; i++) {
    const cur = ring(i);
    for (let j = 0; j < radial; j++) {
      const a = prev[j];
      const b = prev[j + 1];
      const c = cur[j + 1];
      const d = cur[j];
      for (const q of [a, b, c, a, c, d]) {
        pos.push(q.p[0], q.p[1], q.p[2]);
        nor.push(q.n[0], q.n[1], q.n[2]);
        uv.push(q.u, q.v);
      }
    }
    prev = cur;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(nor), 3));
  g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uv), 2));
  return g;
}

// A three-level dendritic arbor. Each level is thinner and shorter than its
// parent, and every branch curves rather than running straight, so the cell
// reads as grown rather than assembled from struts.
function dendriteGeometry() {
  const primaries = [
    [-0.86, 0.62, 0.2],
    [-0.98, -0.46, -0.32],
    [-0.72, 0.34, 0.52],
  ];
  const geoms = [];
  const curl = (v, i, k) => v + Math.sin(i * 2.1 + k * 1.7) * 0.09;

  primaries.forEach((d, i) => {
    const j1 = [SOMA_X + d[0] * 0.78, d[1] * 0.72, d[2] * 0.64];
    geoms.push(
      taperedTube(
        [
          [SOMA_X, 0, 0],
          [SOMA_X + d[0] * 0.34, d[1] * 0.3, d[2] * 0.28],
          [SOMA_X + d[0] * 0.58, curl(d[1] * 0.54, i, 0), d[2] * 0.48],
          j1,
        ],
        0.066,
        0.038,
        9,
      ),
    );

    for (let s = 0; s < 2; s++) {
      const spread = s === 0 ? 1 : -1;
      const j2 = [
        SOMA_X + d[0] * 1.12 + spread * 0.08,
        d[1] * 0.98 + spread * 0.22,
        d[2] * 0.94 + spread * 0.2 * (i === 2 ? -1 : 1),
      ];
      geoms.push(
        taperedTube(
          [
            j1,
            [
              (j1[0] + j2[0]) / 2,
              curl((j1[1] + j2[1]) / 2, i, s + 1),
              (j1[2] + j2[2]) / 2,
            ],
            j2,
          ],
          0.038,
          0.022,
          8,
          12,
        ),
      );

      // Terminal twigs: the level that most sells "grown, not modelled".
      for (let k = 0; k < 2; k++) {
        const w = k === 0 ? 1 : -1;
        const tip = [
          j2[0] + d[0] * 0.3 + w * 0.06,
          j2[1] + d[1] * 0.24 + w * 0.16,
          j2[2] + d[2] * 0.2 + w * 0.14,
        ];
        geoms.push(taperedTube([j2, tip], 0.022, 0.009, 6, 8));
      }
    }
  });
  return mergeGeoms(geoms);
}

function terminalGeometry() {
  const dirs = [
    [0.8, 0.52, 0.22],
    [0.92, -0.1, -0.36],
    [0.72, -0.56, 0.3],
  ];
  const tips = [];
  const geoms = dirs.map((d) => {
    const tip = [AXON_END + d[0] * 0.58, d[1] * 0.56, d[2] * 0.46];
    tips.push(new THREE.Vector3(...tip));
    return taperedTube(
      [
        [AXON_END - 0.06, 0, 0],
        [AXON_END + d[0] * 0.28, d[1] * 0.26, d[2] * 0.22],
        tip,
      ],
      0.05,
      0.026,
      8,
      14,
    );
  });
  return { geometry: mergeGeoms(geoms), tips };
}

export function createNeuron({ variant, theme = "dark" }) {
  const isEarned = variant === "earned";
  const group = new THREE.Group();
  const disposables = [];
  const track = (x) => {
    disposables.push(x);
    return x;
  };
  const colors = PALETTE[theme];

  // --- soma -----------------------------------------------------------
  const somaGeom = track(new THREE.SphereGeometry(0.4, 40, 28));
  const somaMat = track(
    new THREE.MeshStandardMaterial({ color: colors.soma, roughness: 0.62, metalness: 0.06 }),
  );
  const soma = new THREE.Mesh(somaGeom, somaMat);
  soma.position.set(SOMA_X, 0, 0);
  soma.scale.set(1, 0.94, 0.92);
  group.add(soma);

  // --- dendrites (one draw call) ---------------------------------------
  const dendriteMat = track(
    new THREE.MeshStandardMaterial({ color: colors.soma, roughness: 0.7, metalness: 0.04 }),
  );
  group.add(new THREE.Mesh(track(dendriteGeometry()), dendriteMat));

  // --- axon core --------------------------------------------------------
  const axonGeom = track(new THREE.CylinderGeometry(0.055, 0.055, SPAN + 0.5, 10, 1));
  axonGeom.rotateZ(Math.PI / 2);
  const axonMat = track(
    new THREE.MeshStandardMaterial({ color: colors.axon, roughness: 0.75, metalness: 0.02 }),
  );
  const axon = new THREE.Mesh(axonGeom, axonMat);
  axon.position.set((AXON_START + AXON_END) / 2 - 0.18, 0, 0);
  group.add(axon);

  const hillockGeom = track(
    taperedTube(
      [
        [SOMA_X + 0.1, 0, 0],
        [SOMA_X + 0.26, 0, 0],
        [AXON_START - 0.02, 0, 0],
      ],
      0.155,
      0.056,
      12,
      14,
    ),
  );
  group.add(new THREE.Mesh(hillockGeom, axonMat));

  // --- myelin internodes (instanced: one draw call) ---------------------
  const sheathGeom = track(new THREE.CylinderGeometry(1, 1, 1, 14, 1));
  sheathGeom.rotateZ(Math.PI / 2);
  const sheathMat = track(
    new THREE.MeshStandardMaterial({
      color: isEarned ? colors.earned : colors.unbuilt,
      emissive: isEarned ? colors.earnedEmissive : colors.unbuiltEmissive,
      emissiveIntensity: 0.5,
      roughness: 0.4,
      metalness: 0.12,
    }),
  );
  const sheath = new THREE.InstancedMesh(sheathGeom, sheathMat, SEG_COUNT);
  sheath.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(sheath);

  // Both axons start completely bare, so the setup act shows two identical
  // neurons and every difference that follows is visibly earned.
  //
  // The unbuilt axon keeps NO sheath rather than a patchy one. Three
  // independent reviewers read dashed patches as a perforated or lesioned
  // cable — i.e. as damage — which is both wrong and the opposite of the
  // point. An unmyelinated axon is simply bare.
  const NEUTRAL_BOUTON = new THREE.Color(colors.soma);
  const EARNED_BOUTON = new THREE.Color(colors.earned);

  const BASE_R = 0.07;
  const FULL_R = 0.3;
  const dummy = new THREE.Object3D();

  let myelinLevel = 0;

  function setMyelin(level) {
    const t = Math.max(0, Math.min(1, level));
    myelinLevel = t;
    if (isEarned) {
      // boutonMat is created below; guard so the initial call is safe.
      if (boutonMat) {
        boutonMat.color.copy(NEUTRAL_BOUTON).lerp(EARNED_BOUTON, Math.min(1, t * 1.6));
      }
    }
    for (let i = 0; i < SEG_COUNT; i++) {
      // Thin internodes first establish coverage, then the same internodes
      // visibly thicken with subsequent practice across the whole circuit.
      const g = isEarned ? Math.max(0, Math.min(1, t * SEG_COUNT * 4 - i)) : 0;
      const r = (BASE_R + (FULL_R - BASE_R) * t) * g;
      const len = SEG_LEN * (0.72 + 0.28 * g);
      dummy.position.set(SEGMENT_CENTERS[i], 0, 0);
      const on = g > 0.02;
      dummy.scale.set(on ? len : 0, on ? r : 0, on ? r : 0);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      sheath.setMatrixAt(i, dummy.matrix);
    }
    sheath.instanceMatrix.needsUpdate = true;
  }

  // --- terminals + boutons ----------------------------------------------
  const { geometry: termGeom, tips } = terminalGeometry();
  const terminalMat = track(
    new THREE.MeshStandardMaterial({ color: colors.soma, roughness: 0.68, metalness: 0.04 }),
  );
  group.add(new THREE.Mesh(track(termGeom), terminalMat));

  const boutonGeom = track(new THREE.SphereGeometry(0.08, 12, 10));
  let boutonMat = null;
  boutonMat = track(
    new THREE.MeshStandardMaterial({
      color: isEarned ? colors.earned : colors.unbuilt,
      emissive: isEarned ? colors.earnedEmissive : colors.unbuiltEmissive,
      emissiveIntensity: 0.4,
      roughness: 0.5,
    }),
  );
  const boutons = new THREE.InstancedMesh(boutonGeom, boutonMat, tips.length);
  tips.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.scale.setScalar(1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    boutons.setMatrixAt(i, dummy.matrix);
  });
  boutons.instanceMatrix.needsUpdate = true;
  group.add(boutons);

  setMyelin(0);

  const shadowMat = track(
    new THREE.SpriteMaterial({
      map: glowTexture(),
      color: 0x000000,
      transparent: true,
      opacity: theme === "light" ? 0.16 : 0.3,
      depthWrite: false,
    }),
  );
  const shadow = new THREE.Sprite(shadowMat);
  shadow.position.set(-0.1, -0.72, -0.35);
  shadow.scale.set(5.2, 0.52, 1);
  group.add(shadow);

  // --- action potential ---------------------------------------------------
  const pulseGeom = track(new THREE.SphereGeometry(0.098, 14, 12));
  const pulseMat = track(
    new THREE.MeshBasicMaterial({
      color: isEarned ? colors.pulseEarned : colors.pulseUnbuilt,
      transparent: true,
      opacity: 0,
    }),
  );
  const pulse = new THREE.Mesh(pulseGeom, pulseMat);
  group.add(pulse);

  // Kept tight and faint on the unbuilt side: a wide additive halo over a
  // grey pulse reads as a lens artifact rather than a dim signal.
  const haloMat = track(
    new THREE.SpriteMaterial({
      map: glowTexture(),
      color: isEarned ? colors.pulseEarned : colors.pulseUnbuilt,
      transparent: true,
      opacity: 0,
      blending: theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    }),
  );
  const halo = new THREE.Sprite(haloMat);
  group.add(halo);

  function setPulse(x, intensity) {
    pulse.position.set(x, 0, 0);
    halo.position.set(x, 0, 0);
    pulseMat.opacity = intensity;
    pulse.scale.setScalar(isEarned ? 1 : 0.55);
    // The unbuilt impulse gets a stretched comet trail rather than a round
    // bloom. In a still frame a round dot on a bare axon reads as a blemish;
    // a trail reads as something moving slowly, which is the actual point.
    haloMat.opacity = intensity * (isEarned ? 0.34 : 0.6);
    if (isEarned) {
      halo.scale.set(0.72 + intensity * 0.28, 0.72 + intensity * 0.28, 1);
    } else {
      halo.scale.set(1.5, 0.34, 1);
    }
    halo.position.x = x - (isEarned ? 0 : 0.42);
  }
  setPulse(AXON_START, 0);

  function setTheme(name) {
    const c = PALETTE[name] || PALETTE.dark;
    shadowMat.opacity = name === "light" ? 0.16 : 0.3;
    haloMat.blending =
      name === "light" ? THREE.NormalBlending : THREE.AdditiveBlending;
    haloMat.needsUpdate = true;
    somaMat.color.setHex(c.soma);
    dendriteMat.color.setHex(c.soma);
    terminalMat.color.setHex(c.soma);
    axonMat.color.setHex(c.axon);
    sheathMat.color.setHex(isEarned ? c.earned : c.unbuilt);
    sheathMat.emissive.setHex(isEarned ? c.earnedEmissive : c.unbuiltEmissive);
    NEUTRAL_BOUTON.setHex(c.soma);
    EARNED_BOUTON.setHex(c.earned);
    if (isEarned) {
      boutonMat.color.copy(NEUTRAL_BOUTON).lerp(EARNED_BOUTON, Math.min(1, myelinLevel * 1.6));
    } else {
      boutonMat.color.setHex(c.unbuilt);
    }
    boutonMat.emissive.setHex(isEarned ? c.earnedEmissive : c.unbuiltEmissive);
    pulseMat.color.setHex(isEarned ? c.pulseEarned : c.pulseUnbuilt);
    haloMat.color.setHex(isEarned ? c.pulseEarned : c.pulseUnbuilt);
  }

  function setBoutonGlow(v) {
    boutonMat.emissiveIntensity = 0.35 + v * 1.5;
  }

  return {
    group,
    setMyelin,
    setPulse,
    setTheme,
    setBoutonGlow,
    dispose() {
      for (const d of disposables) d.dispose();
      group.clear();
    },
  };
}
