import { useEffect, useState } from 'react';
import type { Plan } from './featureGate';
export function useEntitlements() {
  const [plan, setPlan] = useState<Plan>('free');
  useEffect(() => { const saved = (global as any).__PLAN__ as Plan | undefined; if(saved) setPlan(saved); }, []);
  useEffect(()=>{ (global as any).__PLAN__ = plan; }, [plan]);
  return { plan, setPlan };
}
