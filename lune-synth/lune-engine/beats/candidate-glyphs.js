import * as THREE from "three";

export function createCandidateGlyphs({ scene }) {
  const group = new THREE.Group();
  group.position.set(-1.7, 0.55, 0.05);
  const geom = new THREE.PlaneGeometry(0.18, 0.22);
  const mats = [];
  const meshes = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.MeshBasicMaterial({
      color: 0xf5f0e8,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geom, m);
    mesh.position.set(-1.0 + i * 0.42, 0, 0);
    mats.push(m);
    meshes.push(mesh);
    group.add(mesh);
  }
  scene.add(group);

  return {
    update(t, { candidateT, crossT }) {
      const baseRise = THREE.MathUtils.smoothstep(candidateT, 0.15, 1.0);
      const fadeOut = 1 - crossT;
      for (let i = 0; i < mats.length; i++) {
        const flicker = 0.55 + 0.45 * Math.sin((t * 18) + i * 1.7);
        mats[i].opacity = baseRise * fadeOut * 0.6 * flicker;
      }
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      mats.forEach((m) => m.dispose());
    },
  };
}
