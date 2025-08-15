export type Landmark = { x: number; y: number; z?: number; name: string };
export type Pose = { landmarks: Landmark[] };

// Simple COCO-ish keypoints list (indices matter only for drawing order)
export const KEYPOINTS = [
  'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar',
  'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow',
  'leftWrist', 'rightWrist', 'leftHip', 'rightHip',
  'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'
] as const;
export type KeypointName = typeof KEYPOINTS[number];

// Pairs for skeleton lines
export const EDGES: [KeypointName, KeypointName][] = [
  ['leftShoulder','rightShoulder'],
  ['leftShoulder','leftElbow'], ['leftElbow','leftWrist'],
  ['rightShoulder','rightElbow'], ['rightElbow','rightWrist'],
  ['leftShoulder','leftHip'], ['rightShoulder','rightHip'], ['leftHip','rightHip'],
  ['leftHip','leftKnee'], ['leftKnee','leftAnkle'],
  ['rightHip','rightKnee'], ['rightKnee','rightAnkle']
];