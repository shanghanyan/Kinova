type Point3D = { x: number; y: number; z: number };

export function calculateAngle(A: Point3D, B: Point3D, C: Point3D): number {
  const BA = { x: A.x - B.x, y: A.y - B.y, z: A.z - B.z };
  const BC = { x: C.x - B.x, y: C.y - B.y, z: C.z - B.z };

  const dot = BA.x * BC.x + BA.y * BC.y + BA.z * BC.z;
  const magBA = Math.sqrt(BA.x ** 2 + BA.y ** 2 + BA.z ** 2);
  const magBC = Math.sqrt(BC.x ** 2 + BC.y ** 2 + BC.z ** 2);

  if (magBA === 0 || magBC === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

export function extractAngles(lm: Point3D[]) {
  if (!lm || lm.length < 33) return null;

  return {
    left_knee: calculateAngle(lm[23], lm[25], lm[27]),
    right_knee: calculateAngle(lm[24], lm[26], lm[28]),
    left_hip: calculateAngle(lm[11], lm[23], lm[25]),
    right_hip: calculateAngle(lm[12], lm[24], lm[26]),
    left_elbow: calculateAngle(lm[11], lm[13], lm[15]),
    right_elbow: calculateAngle(lm[12], lm[14], lm[16]),
    left_shoulder: calculateAngle(lm[13], lm[11], lm[23]),
    right_shoulder: calculateAngle(lm[14], lm[12], lm[24]),
    left_ankle: calculateAngle(lm[25], lm[27], lm[31]),
    right_ankle: calculateAngle(lm[26], lm[28], lm[32]),
    trunk_lean: calculateAngle(
      { x: lm[23].x, y: lm[23].y - 1, z: lm[23].z },
      lm[23],
      lm[11]
    ),
    spine: calculateAngle(lm[23], lm[11], lm[0]),
    left_knee_x: lm[25].x,
    right_knee_x: lm[26].x,
    left_ankle_x: lm[27].x,
    right_ankle_x: lm[28].x,
    left_hip_x: lm[23].x,
    right_hip_x: lm[24].x,
  };
}
