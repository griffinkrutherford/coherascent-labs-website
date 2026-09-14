// Fixed silhouettes keep the 3D and reduced-motion webs recognizable and stable.
const SHAPES = [
  { // Broad, off-center orb.
    hub: [-0.2, -0.08], rings: 4, closed: true,
    anchors: [[-1, 0.05], [-0.75, 0.48], [-0.15, 0.6], [0.55, 0.42], [1, 0.08], [0.68, -0.38], [0.02, -0.48], [-0.7, -0.3]],
  },
  { // A triangular corner fan, tethered to a low branch.
    hub: [-0.48, -0.3], rings: 5, closed: false,
    anchors: [[-0.85, 0.35], [-0.62, 0.65], [-0.22, 0.72], [0.18, 0.61], [0.6, 0.5], [1, 0.3], [0.88, -0.1]],
  },
  { // Tall, drooping diamond with a narrow waist.
    hub: [0.08, 0.06], rings: 3, closed: true,
    anchors: [[-0.1, 0.67], [0.4, 0.3], [0.57, -0.03], [0.3, -0.46], [0.12, -0.78], [-0.3, -0.4], [-0.57, -0.04], [-0.4, 0.4]],
  },
  { // Ragged, stretched sheet; a few outer threads have torn away.
    hub: [0.24, 0.1], rings: 4, closed: true, torn: true,
    anchors: [[-1, 0.22], [-0.5, 0.4], [-0.05, 0.32], [0.53, 0.55], [1, 0.18], [0.8, -0.21], [0.35, -0.32], [-0.28, -0.2], [-0.86, -0.4]],
  },
];

export function cobwebSegments(index) {
  const shape = SHAPES[index % SHAPES.length];
  const { hub, anchors, rings } = shape;
  const segments = anchors.map(anchor => [hub, anchor]);
  const between = (a, b, t) => a.map((value, axis) => value + (b[axis] - value) * t);
  const count = shape.closed ? anchors.length : anchors.length - 1;
  for (let ring = 1; ring <= rings; ring++) {
    const radius = ring / (rings + 0.2);
    for (let spoke = 0; spoke < count; spoke++) {
      if (shape.torn && ring >= 3 && (spoke === 1 || spoke === 6)) continue;
      const a = between(hub, anchors[spoke], radius);
      const b = between(hub, anchors[(spoke + 1) % anchors.length], radius);
      const sag = between(between(a, b, 0.5), hub, 0.12 + (spoke % 3) * 0.035);
      segments.push([a, sag], [sag, b]);
    }
  }
  return segments;
}
