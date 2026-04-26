export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface BodyAngles {
  leftElbow: number;
  rightElbow: number;
  leftShoulder: number;
  rightShoulder: number;
  leftHip: number;
  rightHip: number;
  leftKnee: number;
  rightKnee: number;
  torsoAngle: number;
}

function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

export function extractAngles(landmarks: Landmark[]): BodyAngles | null {
  if (!landmarks || landmarks.length < 33) return null;

  return {
    leftElbow: calculateAngle(landmarks[11], landmarks[13], landmarks[15]),
    rightElbow: calculateAngle(landmarks[12], landmarks[14], landmarks[16]),
    leftShoulder: calculateAngle(landmarks[13], landmarks[11], landmarks[23]),
    rightShoulder: calculateAngle(landmarks[14], landmarks[12], landmarks[24]),
    leftHip: calculateAngle(landmarks[11], landmarks[23], landmarks[25]),
    rightHip: calculateAngle(landmarks[12], landmarks[24], landmarks[26]),
    leftKnee: calculateAngle(landmarks[23], landmarks[25], landmarks[27]),
    rightKnee: calculateAngle(landmarks[24], landmarks[26], landmarks[28]),
    torsoAngle: calculateAngle(
      landmarks[11],
      {
        x: (landmarks[23].x + landmarks[24].x) / 2,
        y: (landmarks[23].y + landmarks[24].y) / 2,
      },
      landmarks[12],
    ),
  };
}
