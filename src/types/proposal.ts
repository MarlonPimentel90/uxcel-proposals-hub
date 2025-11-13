export type ProposalStatus = "pending" | "approved" | "rejected";

export interface Proposal {
  id: string;
  clientName: string;
  projectType: string;
  sentDate: Date;
  value: number;
  status: ProposalStatus;
  lastFollowUp: Date;
  notes: string;
}
