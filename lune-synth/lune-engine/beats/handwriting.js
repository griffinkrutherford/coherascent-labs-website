import * as THREE from "three";

export function createHandwriting({ scene }) {
  const geom = new THREE.PlaneGeometry(2.6, 0.7);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x7ab8ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(-1.7, 0.0, 0);
  scene.add(mesh);

  return {
    update(_t, { inkT, crossT }) {
      const fadeOut = 1 - 0.5 * crossT;
      mat.opacity = THREE.MathUtils.smoothstep(inkT, 0, 1) * 0.78 * fadeOut;
    },
    dispose() {
      scene.remove(mesh);
      geom.dispose();
      mat.dispose();
    },
  };
}
