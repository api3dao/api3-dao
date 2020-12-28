type proposalType = "daoGovernance" | "arbitaryTx" | "grants";

export interface Proposal {
  type: proposalType;
  metadata: string;
  executionScript: string;
};