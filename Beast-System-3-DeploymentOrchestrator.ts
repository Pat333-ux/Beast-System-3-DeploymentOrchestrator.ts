// Beast-System-3-DeploymentOrchestrator.ts
// Unified deployment orchestrator for Beast System 3.0

import { EnvConfig } from "./Beast-System-3-EnvConfig";
import { ModuleRegistry } from "./Beast-System-3-ModuleRegistry";
import { MetricsMonitor } from "./Beast-System-3-MetricsMonitor";
import { WorkflowStateMachine } from "./Beast-System-3-WorkflowStateMachine";

export class DeploymentOrchestrator {
  private registry = new ModuleRegistry();
  private metrics = new MetricsMonitor();
  private workflowState = new WorkflowStateMachine();

  // ---- REGISTER MODULES ----
  registerModule(module: any): void {
    this.registry.register(module);
    this.metrics.moduleHealth(module.id, "registered");
  }

  // ---- INITIALIZE SYSTEM ----
  initialize(): void {
    EnvConfig.load();
    this.metrics.record("system.init", "complete");
  }

  // ---- START SYSTEM ----
  async start(): Promise<void> {
    this.workflowState.transition("START");
    this.metrics.record("system.state", "starting");

    this.registry.startAll();
    this.metrics.record("system.modules", "started");

    this.metrics.stability(100);
  }

  // ---- STOP SYSTEM ----
  async stop(): Promise<void> {
    this.workflowState.transition("PAUSE");
    this.registry.stopAll();
    this.metrics.record("system.modules", "stopped");
  }

  // ---- GET SYSTEM STATUS ----
  status(): any {
    return {
      workflow: this.workflowState.getState(),
      modules: this.registry.list(),
      metrics: this.metrics.getMetrics()
    };
  }
}
