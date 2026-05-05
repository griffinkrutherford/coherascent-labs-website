import * as THREE from "three";

export function createTagline({ scene }) {
  const geom = new THREE.PlaneGeometry(2.0, 0.04);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xf5f0e8,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(1.4, -1.05, 0.05);
  scene.add(mesh);

  return {
    update(_t, { resolveT }) {
      mat.opacity = THREE.MathUtils.smoothstep(resolveT, 0, 1) * 0.9;
    },
    dispose() {
      scene.remove(mesh);
      geom.dispose();
      mat.dispose();
    },
  };
}
