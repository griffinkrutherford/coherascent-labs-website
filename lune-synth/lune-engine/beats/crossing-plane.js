import * as THREE from "three";

export function createCrossingPlane({ scene }) {
  const geom = new THREE.PlaneGeometry(0.18, 2.0);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xb29bff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(0, 0, 0.1);
  scene.add(mesh);

  return {
    update(_t, { crossT }) {
      const peak = Math.sin(THREE.MathUtils.clamp(crossT, 0, 1) * Math.PI);
      mat.opacity = peak * 0.7;
      mesh.scale.x = 1 + peak * 1.4;
    },
    dispose() {
      scene.remove(mesh);
      geom.dispose();
      mat.dispose();
    },
  };
}
