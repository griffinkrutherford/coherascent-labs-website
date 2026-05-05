import * as THREE from "three";
import { createHandwriting } from "./beats/handwriting.js";
import { createNeuralMist } from "./beats/neural-mist.js";
import { createCandidateGlyphs } from "./beats/candidate-glyphs.js";
import { createCrossingPlane } from "./beats/crossing-plane.js";
import { createSymbolicLattice } from "./beats/symbolic-lattice.js";
import { createAuditPulse } from "./beats/audit-pulse.js";
import { createTagline } from "./beats/tagline.js";

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 6.4);
  camera.lookAt(0, 0, 0);

  const beats = [
    createHandwriting({ scene }),
    createNeuralMist({ scene }),
    createCandidateGlyphs({ scene }),
    createCrossingPlane({ scene }),
    createSymbolicLattice({ scene }),
    createAuditPulse({ scene }),
    createTagline({ scene }),
  ];

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 600;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 340;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();

  return {
    update(t, slices) {
      for (const b of beats) b.update(t, slices);
    },
    render() {
      renderer.render(scene, camera);
    },
    resize,
    dispose() {
      for (const b of beats) b.dispose();
      renderer.dispose();
    },
  };
}
