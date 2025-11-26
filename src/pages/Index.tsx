import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { ProposalsTable } from "@/components/ProposalsTable";
import { ProposalDialog } from "@/components/ProposalDialog";
import { Proposal, ProposalStatus } from "@/types/proposal";
import logo from "@/assets/logo.png";

const Index = () => {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: "1",
      clientName: "Construtora Silva & Cia",
      sentDate: new Date("2025-02-15"),
      value: 85000,
      status: "pending",
      lastFollowUp: new Date("2025-02-20"),
      expectedReturnDate: new Date("2025-03-01"),
      notes: "Cliente solicitou ajustes no cronograma",
    },
    {
      id: "2",
      clientName: "Empreendimentos Costa",
      sentDate: new Date("2025-02-10"),
      value: 42000,
      status: "approved",
      lastFollowUp: new Date("2025-02-18"),
      expectedReturnDate: new Date("2025-02-25"),
      notes: "Proposta aprovada, aguardando contrato",
    },
    {
      id: "3",
      clientName: "Incorporadora Horizonte",
      sentDate: new Date("2025-01-28"),
      value: 68000,
      status: "rejected",
      lastFollowUp: new Date("2025-02-05"),
      expectedReturnDate: new Date("2025-02-15"),
      notes: "Cliente escolheu outra empresa",
    },
    {
      id: "4",
      clientName: "Residencial Park View",
      sentDate: new Date("2025-02-01"),
      value: 25000,
      status: "pending",
      lastFollowUp: new Date("2025-02-08"),
      expectedReturnDate: new Date("2025-11-28"),
      notes: "Aguardando análise do comitê",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | undefined>();

  const handleAddProposal = (proposal: Omit<Proposal, "id">) => {
    const newProposal: Proposal = {
      ...proposal,
      id: Date.now().toString(),
    };
    setProposals([newProposal, ...proposals]);
  };

  const handleEditProposal = (proposal: Proposal) => {
    setProposals(proposals.map((p) => (p.id === proposal.id ? proposal : p)));
  };

  const handleDeleteProposal = (id: string) => {
    setProposals(proposals.filter((p) => p.id !== id));
  };

  const openEditDialog = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProposal(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Complementare Logo" className="h-20 w-auto" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Controle de Propostas
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gerenciamento de projetos complementares de engenharia
                </p>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md">
              <Plus className="h-4 w-4" />
              Nova Proposta
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <Dashboard proposals={proposals} />
        <ProposalsTable
          proposals={proposals}
          onEdit={openEditDialog}
          onDelete={handleDeleteProposal}
        />
      </main>

      <ProposalDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        onSave={editingProposal ? handleEditProposal : handleAddProposal}
        proposal={editingProposal}
      />
    </div>
  );
};

export default Index;
