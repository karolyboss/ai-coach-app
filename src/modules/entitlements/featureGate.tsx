export type Plan = 'free' | 'pro';
export type Feature =
  | 'workouts.unlimited'   // Unlimited sets per day
  | 'history.unlimited'    // Full workout history
  | 'voice'                // TTS + haptics coaching
  | 'set.summary'          // Set summary modal
  | 'posture.plan';        // Posture programs

const gates: Record<Feature, Record<Plan, boolean>> = {
  'workouts.unlimited': { free: false, pro: true },
  'history.unlimited' : { free: false, pro: true },
  'voice'             : { free: false, pro: true },
  'set.summary'       : { free: true,  pro: true },
  'posture.plan'      : { free: false, pro: true },
};

export function isAllowed(plan: Plan, feature: Feature) {
  return gates[feature][plan];
}