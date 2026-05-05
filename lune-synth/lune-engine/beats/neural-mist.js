import * as THREE from "three";

export function createNeuralMist({ scene }) {
  const geom = new THREE.PlaneGeometry(3.2, 1.4);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x4a7fc8,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(-1.7, 0.45, -0.05);
  scene.add(mesh);

  return {
    update(_t, { inkT }) {
      const rise = THREE.MathUtils.smoothstep(inkT, 0.1, 0.9);
      mat.opacity = rise * 0.32;
      mesh.position.y = 0.2 + rise * 0.4;
    },
    dispose() {
      scene.remove(mesh);
      geom.dispose();
      mat.dispose();
    },
  };
}
