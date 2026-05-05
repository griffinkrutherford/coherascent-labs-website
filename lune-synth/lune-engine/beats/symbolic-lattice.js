import * as THREE from "three";

const NODE_POSITIONS = [
  [-0.6, -0.4],
  [-0.1,  0.35],
  [ 0.4,  0.55],
  [ 0.9,  0.35],
  [ 1.1, -0.4],
  [ 0.4, -0.4],
];

export function createSymbolicLattice({ scene }) {
  const group = new THREE.Group();
  group.position.set(1.4, 0.0, 0);
  const geom = new THREE.SphereGeometry(0.06, 16, 16);
  const mats = [];
  const meshes = [];
  for (let i = 0; i < NODE_POSITIONS.length; i++) {
    const m = new THREE.MeshBasicMaterial({
      color: 0xd8b56a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geom, m);
    mesh.position.set(NODE_POSITIONS[i][0], NODE_POSITIONS[i][1], 0);
    mats.push(m);
    meshes.push(mesh);
    group.add(mesh);
  }
  scene.add(group);

  return {
    update(_t, { latticeT }) {
      const total = mats.length;
      for (let i = 0; i < total; i++) {
        const start = i / total;
        const end = (i + 1) / total;
        const local = THREE.MathUtils.smoothstep(latticeT, start, end);
        mats[i].opacity = local * 0.95;
      }
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      mats.forEach((m) => m.dispose());
    },
  };
}
