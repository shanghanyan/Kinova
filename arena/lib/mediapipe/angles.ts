type P = { x: number; y: number; z: number; visibility?: number };

export function angle(A: P, B: P, C: P): number {
  const BA = { x: A.x - B.x, y: A.y - B.y, z: (A.z || 0) - (B.z || 0) };
  const BC = { x: C.x - B.x, y: C.y - B.y, z: (C.z || 0) - (B.z || 0) };
  const dot = BA.x * BC.x + BA.y * BC.y + BA.z * BC.z;
  const magBA = Math.sqrt(BA.x ** 2 + BA.y ** 2 + BA.z ** 2);
  const magBC = Math.sqrt(BC.x ** 2 + BC.y ** 2 + BC.z ** 2);
  if (!magBA || !magBC) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / (magBA * magBC)))) * 180) / Math.PI;
}

export function extractAllAngles(lm: P[]) {
  if (!lm || lm.length < 33) return null;
  return {
    left_knee: angle(lm[23], lm[25], lm[27]),
    right_knee: angle(lm[24], lm[26], lm[28]),
    left_hip: angle(lm[11], lm[23], lm[25]),
    right_hip: angle(lm[12], lm[24], lm[26]),
    left_elbow: angle(lm[11], lm[13], lm[15]),
    right_elbow: angle(lm[12], lm[14], lm[16]),
    left_shoulder: angle(lm[13], lm[11], lm[23]),
    right_shoulder: angle(lm[14], lm[12], lm[24]),
    left_ankle: angle(lm[25], lm[27], lm[31]),
    right_ankle: angle(lm[26], lm[28], lm[32]),
    trunk_lean: angle({ x: lm[23].x, y: lm[23].y - 1, z: lm[23].z }, lm[23], lm[11]),
    left_knee_x: lm[25].x,
    right_knee_x: lm[26].x,
    left_ankle_x: lm[27].x,
    right_ankle_x: lm[28].x,
    left_hip_x: lm[23].x,
    right_hip_x: lm[24].x,
    left_shoulder_y: lm[11].y,
    right_shoulder_y: lm[12].y,
    left_hip_y: lm[23].y,
    right_hip_y: lm[24].y,
    left_ankle_y: lm[27].y,
    right_ankle_y: lm[28].y,
    nose_x: lm[0].x,
    nose_y: lm[0].y,
  };
}
