// Placeholder types for the native posture engine bridge
export type Fault = 'knee_valgus'|'lumbar_flexion'|'forward_head';
export type PostureEvent = { type: 'fault'; fault: Fault; confidence: number } | { type: 'rep'; count: number };
export interface PostureModule {
  start(exercise: string): Promise<void>;
  stop(): Promise<void>;
  addListener(cb: (evt: PostureEvent)=>void): void;
  removeListener(cb: (evt: PostureEvent)=>void): void;
}
