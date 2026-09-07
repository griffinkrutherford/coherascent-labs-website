import * as THREE from "../vendor/three/three.module.js";
import { createNeuron, AXON_START, AXON_END, NODE_POSITIONS } from "./neuron.js";

const ROW_Y = 1.02;

// Saltatory conduction: the impulse dwells at each node of Ranvier and leaps
// the insulated internode between them. A sharp ease makes the jump read as a
// jump rather than a slide — this is the single most legible difference
// between the two axons, so it carries the comparison.
function saltatoryX(p) {
  const n = NODE_POSITIONS.length - 1;
  const scaled = Math.max(0, Math.min(0.9999, p)) * n;
  const i = Math.floor(scaled);
  const frac = scaled - i;
  const eased = frac < 0.5 ? Math.pow(frac * 2, 0.42) * 0.5 : 1 - Math.pow((1 - frac) * 2, 2.2) * 0.5;
  return THREE.MathUtils.lerp(NODE_POSITIONS[i], NODE_POSITIONS[i + 1], eased);
}

export function createScene(canvas, { theme = "dark" } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1.78, 0.1, 100);
  camera.position.set(0, 0, 9.15);
  camera.lookAt(0, 0, 0);

  // Rotating the model rather than orbiting the camera keeps the key light
  // fixed relative to the viewer, so no rotation angle is badly lit.
  const root = new THREE.Group();
  scene.add(root);

  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(2.4, 3.2, 4.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fc0ff, 1.15);
  rim.position.set(-3.5, -1.6, -2.8);
  scene.add(rim);

  // Lighting has to follow the theme too. Swapping only material colors
  // leaves a light-theme page lit for a dark one, which renders the somas
  // near-black on white.
  function applyLighting(name) {
    const isLight = name === "light";
    ambient.intensity = isLight ? 2.15 : 0.85;
    key.intensity = isLight ? 1.35 : 2.1;
    rim.intensity = isLight ? 0.45 : 1.15;
  }
  let bypassBase = 0.3;
  applyLighting(theme);

  const unbuilt = createNeuron({ variant: "unbuilt", theme });
  unbuilt.group.position.y = ROW_Y;
  root.add(unbuilt.group);

  const earned = createNeuron({ variant: "earned", theme });
  earned.group.position.y = -ROW_Y;
  root.add(earned.group);

  // The copied answer: it arrives at the destination without ever traversing
  // the axon. Nothing is damaged — the circuit simply never fires.
  const packetGeom = new THREE.OctahedronGeometry(0.15, 0);
  const packetMat = new THREE.MeshBasicMaterial({
    color: 0xff5d87,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const packet = new THREE.Mesh(packetGeom, packetMat);
  root.add(packet);

  const bypassCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.85, ROW_Y + 0.72, 1.0),
    new THREE.Vector3(-0.2, ROW_Y + 1.0, 0.66),
    new THREE.Vector3(1.45, ROW_Y + 0.7, 0.36),
    new THREE.Vector3(AXON_END + 0.30, ROW_Y + 0.34, 0.30),
  ]);
  const bypassGeom = new THREE.TubeGeometry(bypassCurve, 40, 0.012, 5, false);
  const bypassMat = new THREE.MeshBasicMaterial({
    color: 0xff5d87,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const bypass = new THREE.Mesh(bypassGeom, bypassMat);
  root.add(bypass);

  // Accent colouring lives apart from applyLighting because these materials are
  // created after the lights.
  function applyAccent(name) {
    const isLight = name === "light";
    packetMat.color.setHex(isLight ? 0xd81b60 : 0xff5d87);
    bypassMat.color.setHex(isLight ? 0xd81b60 : 0xff5d87);
    bypassBase = isLight ? 0.5 : 0.3;
  }
  applyAccent(theme);

  // Rotation is clamped. Past roughly ±60° the camera looks down the axon's
  // own axis and both neurons collapse to blobs — the entire comparison is
  // lost. This is an explanatory diagram, not a model viewer, so the range is
  // limited to angles where the story always reads.
  const AZ_LIMIT = THREE.MathUtils.degToRad(52);
  const EL_LIMIT = THREE.MathUtils.degToRad(14);
  let azimuth = THREE.MathUtils.degToRad(24);
  let elevation = THREE.MathUtils.degToRad(9);

  function applyRotation() {
    azimuth = Math.max(-AZ_LIMIT, Math.min(AZ_LIMIT, azimuth));
    elevation = Math.max(-EL_LIMIT, Math.min(EL_LIMIT, elevation));
    root.rotation.y = azimuth;
    root.rotation.x = elevation;
  }
  applyRotation();

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 800;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 450;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  function update(t, s) {
    earned.setMyelin(s.myelinT);
    unbuilt.setMyelin(0);

    if (s.firing) {
      // Result act: the earned axon completes several traversals in the time
      // the unbuilt one fails to complete even one.
      const pe = (s.resultT * 3.1) % 1;
      earned.setPulse(saltatoryX(pe), 1);
      earned.setBoutonGlow(0.55 + 0.45 * Math.sin(s.resultT * 22));

      unbuilt.setPulse(AXON_START, 0);
      unbuilt.setBoutonGlow(0.04);
      packetMat.opacity = 0;
      bypassMat.opacity = 0;
    } else if (s.practiceT > 0) {
      // Practice act: each rep fires the earned axon end to end and thickens
      // its sheath; the unbuilt side receives a packet that skips the axon.
      earned.setPulse(saltatoryX(s.repProgress), 0.92);
      earned.setBoutonGlow(s.myelinT * 0.6);

      unbuilt.setPulse(AXON_START, 0);

      // The packet flies in and lands ON the terminal, then the bouton flashes:
      // the answer is delivered while the axon between never carries anything.
      const k = s.copyT;
      const land = Math.min(1, k / 0.82);
      const ease = 1 - Math.pow(1 - land, 2.4);
      bypassMat.opacity = bypassBase * (k < 0.08 ? k / 0.08 : 1);
      packet.position.copy(bypassCurve.getPoint(ease));
      const settle = Math.max(0, (k - 0.7) / 0.3);
      packet.scale.setScalar(1 - 0.7 * settle);
      packet.rotation.set(k * 5.2, k * 3.7, 0);
      packetMat.opacity = (k < 0.06 ? k / 0.06 : 1) * (1 - settle) * 0.95;
      unbuilt.setBoutonGlow(0.03 + settle * 0.5);
    } else {
      earned.setPulse(AXON_START, 0);
      unbuilt.setPulse(AXON_START, 0);
      earned.setBoutonGlow(0);
      unbuilt.setBoutonGlow(0);
      packetMat.opacity = 0;
      bypassMat.opacity = 0;
    }
  }

  return {
    update,
    render() {
      renderer.render(scene, camera);
    },
    resize,
    rotateBy(dAz, dEl) {
      azimuth += dAz;
      elevation += dEl;
      applyRotation();
    },
    setCamera(azDeg, elDeg) {
      azimuth = THREE.MathUtils.degToRad(azDeg);
      elevation = THREE.MathUtils.degToRad(elDeg);
      applyRotation();
    },
    getCamera() {
      return {
        az: THREE.MathUtils.radToDeg(azimuth),
        el: THREE.MathUtils.radToDeg(elevation),
      };
    },
    getStats() {
      return {
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        programs: renderer.info.programs ? renderer.info.programs.length : -1,
      };
    },
    setTheme(name) {
      applyLighting(name);
      applyAccent(name);
      unbuilt.setTheme(name);
      earned.setTheme(name);
    },
    dispose() {
      unbuilt.dispose();
      earned.dispose();
      packetGeom.dispose();
      packetMat.dispose();
      bypassGeom.dispose();
      bypassMat.dispose();
      renderer.dispose();
    },
  };
}
