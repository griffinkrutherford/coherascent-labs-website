import * as THREE from "three";

export function createAuditPulse({ scene }) {
  const ring = new THREE.RingGeometry(0.08, 0.18, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xe6a04a,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(ring, mat);
  mesh.position.set(1.8, -0.4, 0.02);
  scene.add(mesh);

  return {
    update(_t, { auditT, resolveT }) {
      const flare = THREE.MathUtils.smoothstep(auditT, 0, 1);
      const ease = 1 - resolveT * 0.6;
      mat.opacity = flare * 0.85 * ease;
      const scale = 0.7 + flare * (1.6 + resolveT * 0.8);
      mesh.scale.setScalar(scale);
    },
    dispose() {
      scene.remove(mesh);
      ring.dispose();
      mat.dispose();
    },
  };
}
