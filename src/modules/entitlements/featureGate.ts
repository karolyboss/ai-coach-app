export type Plan = 'free' | 'pro';
export function isAllowed(plan: Plan, feature: string): boolean {
  const rules: Record<string, Plan> = {
    'coach.exercises.full': 'pro',
    'coach.exercises.core6': 'free',
    'workouts.daily2': 'free',
    'workouts.unlimited': 'pro',
    'posture.scans.5day': 'free',
    'posture.scans.unlimited': 'pro',
    'meals.photos.30mo': 'free',
    'meals.photos.unlimited': 'pro',
    'meals.depth.ar': 'pro',
    'insights.advanced': 'pro',
    'desk.mode': 'pro'
  };
  const needs = rules[feature];
  if(!needs) return true; return plan === 'pro' || needs === 'free';
}
