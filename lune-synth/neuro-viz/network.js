import * as THREE from "../vendor/three/three.module.js";
import { createNeuron } from "./neuron.js";

// Route shapes are a learning metaphor, not anatomical axon geometry.
// Keep the biological models intact and draw the route as a separate overlay.
export function createNetwork({ variant, theme }) {
  const earned = variant === "earned";
  const group = new THREE.Group();
  const resources = [];
  const track = (value) => (resources.push(value), value);
  const y = earned ? -1.1 : 1.05;
  const offsets = earned ? [0, 0, 0, 0] : [0, 0.38, -0.24, 0.2];
  const positions = offsets.map((dy, i) => new THREE.Vector3(-3.35 + i * 1.93, y + dy, 0));
  const cells = positions.map((position, i) => {
    const cell = createNeuron({ variant, theme });
    const angle = i < 3 ? Math.atan2(positions[i + 1].y - position.y, 1.93) : 0;
    cell.group.scale.setScalar(0.36);
    cell.group.rotation.z = angle;
    // Anchor the soma, rather than the model origin, to its network position.
    cell.group.position.copy(position).add(new THREE.Vector3(2.36 * 0.36 * Math.cos(angle), 2.36 * 0.36 * Math.sin(angle), 0));
    group.add(cell.group);
    return cell;
  });
  // Transparent PNGs rendered from our existing neuron model. Three depth
  // layers add distant context with two triangles per cell instead of meshes.
  const loader = new THREE.TextureLoader();
  const backgroundTextures = [1, 2, 3].map(i => {
    const texture = track(loader.load(`/lune-synth/neuro-viz/assets/background-neuron-${i}.png`));
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });
  const backgroundMaterials = [];
  const backgroundDepths = [-1.3, -3.6, -4.8];
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < 6; i++) {
      const material = track(new THREE.SpriteMaterial({
        map: backgroundTextures[(i + layer) % 3],
        transparent: true,
        depthWrite: false,
        opacity: 0.18 - layer * 0.035,
        rotation: Math.sin(i * 2.3 + layer) * 0.55,
      }));
      backgroundMaterials.push({ material, layer });
      const cell = new THREE.Sprite(material);
      cell.position.set(
        -3.2 + (i % 3) * 3.1 + Math.sin(i * 3.7 + layer * 2.1) * 0.5,
        y + (i < 3 ? 1 : -1) * (0.48 + layer * 0.18) + Math.cos(i * 2.1 + layer) * 0.16,
        backgroundDepths[layer] - (i % 2) * 0.25,
      );
      const width = 1.65 + (i % 3) * 0.17;
      cell.scale.set(width, width / 2, 1);
      group.add(cell);
    }
  }

  const end = new THREE.Vector3(4.4, positions[3].y, 0);
  const anchors = [...positions, end];
  const points = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1];
    points.push(a.clone().setZ(0.16));
    if (!earned) {
      // Angular detours and a short reversal make uncertainty visible even
      // in a still image. The slower packet follows these exact detours.
      for (const [f, dy] of [[0.28, 0.27], [0.52, -0.23], [0.43, 0.06], [0.74, 0.23]]) {
        points.push(a.clone().lerp(b, f).add(new THREE.Vector3(0, dy, 0.16)));
      }
    }
  }
  points.push(end.clone().setZ(0.16));
  const curve = new THREE.CurvePath();
  for (let i = 1; i < points.length; i++) curve.add(new THREE.LineCurve3(points[i - 1], points[i]));
  const routeGeom = track(new THREE.BufferGeometry().setFromPoints(points));
  const routeMat = track(earned
    ? new THREE.LineBasicMaterial({ transparent: true, opacity: 0.8, depthTest: false })
    : new THREE.LineDashedMaterial({ transparent: true, opacity: 0.85, dashSize: 0.09, gapSize: 0.055, depthTest: false }));
  const route = new THREE.Line(routeGeom, routeMat);
  route.computeLineDistances();
  route.renderOrder = 3;
  group.add(route);

  const trailGeom = track(new THREE.BufferGeometry().setFromPoints(curve.getPoints(160)));
  const trailMat = track(new THREE.LineBasicMaterial({ transparent: true, opacity: 1, depthTest: false }));
  const trail = new THREE.Line(trailGeom, trailMat);
  trail.renderOrder = 4;
  group.add(trail);

  // A bright bead and three trailing beads remain legible at oblique angles.
  const beadGeom = track(new THREE.SphereGeometry(0.065, 12, 8));
  const beads = Array.from({ length: 4 }, (_, i) => {
    const material = track(new THREE.MeshBasicMaterial({ transparent: true, opacity: 1 - i * 0.22, depthTest: false }));
    const bead = new THREE.Mesh(beadGeom, material);
    bead.scale.setScalar(1 - i * 0.16);
    bead.renderOrder = 5;
    group.add(bead);
    return bead;
  });
  const targetMat = track(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthTest: false }));
  const target = new THREE.Mesh(track(new THREE.RingGeometry(0.12, 0.145, 32)), targetMat);
  target.position.copy(points.at(-1));
  group.add(target);

  // Soft additive halos give the signal and insulated route a visible glow
  // without a fullscreen bloom pass or brightening the background PNGs.
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 64;
  const ctx = glowCanvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(255,255,255,0.65)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.16)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const glowTexture = track(new THREE.CanvasTexture(glowCanvas));
  const glowMaterials = [];
  function makeGlow() {
    const material = track(new THREE.SpriteMaterial({ map: glowTexture,
      transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, depthTest: false, opacity: 0.3 }));
    glowMaterials.push(material);
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 2;
    group.add(sprite);
    return sprite;
  }
  const routeGlows = positions.map((position, i) => {
    const glow = makeGlow();
    glow.position.copy(position).lerp(anchors[i + 1], 0.5).setZ(0.08);
    glow.scale.set(2.0, 0.45, 1);
    return glow;
  });
  const signalGlow = makeGlow();
  signalGlow.scale.set(0.8, 0.8, 1);

  function setTheme(name) {
    cells.forEach(cell => cell.setTheme(name));
    for (const { material, layer } of backgroundMaterials) {
      material.color.setHex(name === "light" ? 0x687a96 : 0x94a8c8);
      material.opacity = (name === "light" ? 0.16 : 0.18) - layer * 0.035;
    }
    const color = earned ? (name === "light" ? 0x245fc5 : 0x72b9ff) : (name === "light" ? 0xa85316 : 0xffb16b);
    [routeMat, trailMat, targetMat, ...glowMaterials, ...beads.map(b => b.material)].forEach(m => m.color.setHex(color));
  }
  setTheme(theme);

  function update(s, progress) {
    const active = s.firing || (earned && s.practiceT > 0);
    const p = s.firing ? progress : s.practicePulse;
    cells.forEach((cell, i) => {
      cell.setMyelin(earned ? s.myelinT : 0);
      cell.setPulse(0, 0); // Network packet replaces each neuron's local pulse.
      cell.setBoutonGlow(active && p >= i / 4 ? (earned ? 0.8 : 0.25) : 0);
    });
    routeMat.opacity = s.firing ? 0.75 : earned ? 0.2 + s.myelinT * 0.45 : 0.22;
    trail.visible = active;
    trailGeom.setDrawRange(0, Math.max(0, Math.floor(p * 160) + 1));
    beads.forEach((bead, i) => {
      bead.visible = active && p >= i * 0.016;
      bead.position.copy(curve.getPoint(Math.max(0, p - i * 0.016)));
    });
    signalGlow.visible = active;
    signalGlow.position.copy(beads[0].position);
    signalGlow.material.opacity = earned ? 0.85 : 0.65;
    routeGlows.forEach(glow => { glow.material.opacity = earned ? s.myelinT * 0.5 : 0.1; });
    target.scale.setScalar(active && p >= 1 ? 1.35 : 1);
    targetMat.opacity = active && p >= 1 ? 1 : 0.35;
  }

  return { group, update, setTheme, dispose() {
    cells.forEach(cell => cell.dispose());
    resources.forEach(resource => resource.dispose());
    group.clear();
  } };
}
