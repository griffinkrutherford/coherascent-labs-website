import * as THREE from "../vendor/three/three.module.js";
import { createNetwork } from "./network.js";
import { computeTransfer } from "./timeline.js";

export function createScene(canvas, { theme = "dark" } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: dpr < 1.5,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1.78, 0.1, 100);
  camera.position.set(0.25, 0, 9.8);
  camera.lookAt(0.25, 0, 0);

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
  applyLighting(theme);
  const unbuilt = createNetwork({ variant: "unbuilt", theme });
  const earned = createNetwork({ variant: "earned", theme });
  root.add(unbuilt.group, earned.group);

  // Rotation is clamped. Past roughly ±60° the camera looks down the axon's
  // own axis and both neurons collapse to blobs, the entire comparison is
  // lost. This is an explanatory diagram, not a model viewer, so the range is
  // limited to angles where the story always reads.
  const AZ_LIMIT = THREE.MathUtils.degToRad(42);
  const EL_LIMIT = THREE.MathUtils.degToRad(8);
  let azimuth = THREE.MathUtils.degToRad(24);
  let elevation = THREE.MathUtils.degToRad(6);

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
    // Give the lower route room beneath its label on narrow screens.
    earned.group.position.y = w <= 520 ? -0.9 : 0;
    unbuilt.group.position.y = 0;
    // Preserve horizontal framing when the mobile stage becomes taller.
    camera.position.z = Math.max(9.8, 9.8 * (16 / 9) / camera.aspect);
    camera.updateProjectionMatrix();
  }
  resize();

  function update(t, s) {
    const transfer = computeTransfer(s.resultT, s.myelinT);
    earned.update(s, transfer.earned);
    unbuilt.update(s, transfer.unbuilt);
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
      unbuilt.setTheme(name);
      earned.setTheme(name);
    },
    dispose() {
      unbuilt.dispose();
      earned.dispose();
      renderer.dispose();
    },
  };
}
