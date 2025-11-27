import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { ProposalsTable } from "@/components/ProposalsTable";
import { ProposalDialog } from "@/components/ProposalDialog";
import { Proposal } from "@/types/proposal";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Usado para avisos visuais

const Index = () => {
  // 1. Começamos com uma lista vazia, esperando os dados do banco
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | undefined>();

  // 2. Esta função vai no Supabase e busca os dados reais
  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('sent_date', { ascending: false });

      if (error) throw error;

      // Tradutor: Converte do formato do Banco (client_name) para o Site (clientName)
      const formattedProposals: Proposal[] = data.map((p: any) => ({
        id: p.id,
        clientName: p.client_name,
        sentDate: new Date(p.sent_date),
        value: Number(p.value),
        status: p.status,
        lastFollowUp: p.last_follow_up ? new Date(p.last_follow_up) : undefined,
        expectedReturnDate: p.expected_return_date ? new Date(p.expected_return_date) : undefined,
        notes: p.notes
      }));

      setProposals(formattedProposals);
    } catch (error) {
      console.error("Erro ao buscar propostas:", error);
      toast.error("Erro ao carregar as propostas.");
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega os dados assim que a tela abre
  useEffect(() => {
    fetchProposals();
  }, []);

  // 3. Função para SALVAR (Criar nova)
  const handleAddProposal = async (proposal: Omit<Proposal, "id">) => {
    try {
      // Tradutor inverso: Do Site para o Banco
      const { error } = await supabase.from('proposals').insert({
        client_name: proposal.clientName,
        sent_date: proposal.sentDate.toISOString(),
        value: proposal.value,
        status: proposal.status,
        last_follow_up: proposal.lastFollowUp?.toISOString(),
        expected_return_date: proposal.expectedReturnDate?.toISOString(),
        notes: proposal.notes
      });

      if (error) throw error;

      toast.success("Proposta criada com sucesso!");
      fetchProposals(); // Atualiza a lista na tela
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar:", error);
      toast.error("Erro ao salvar a proposta.");
    }
  };

  // 4. Função para EDITAR
  const handleEditProposal = async (proposal: Proposal) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          client_name: proposal.clientName,
          sent_date: proposal.sentDate.toISOString(),
          value: proposal.value,
          status: proposal.status,
          last_follow_up: proposal.lastFollowUp?.toISOString(),
          expected_return_date: proposal.expectedReturnDate?.toISOString(),
          notes: proposal.notes
        })
        .eq('id', proposal.id);

      if (error) throw error;

      toast.success("Proposta atualizada!");
      fetchProposals();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar a proposta.");
    }
  };

  // 5. Função para DELETAR
  const handleDeleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Proposta excluída.");
      fetchProposals();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao excluir.");
    }
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
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando dados do sistema...</span>
          </div>
        ) : (
          <>
            <Dashboard proposals={proposals} />
            <ProposalsTable
              proposals={proposals}
              onEdit={openEditDialog}
              onDelete={handleDeleteProposal}
            />
          </>
        )}
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
