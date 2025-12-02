import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, LogOut, Lock } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { ProposalsTable } from "@/components/ProposalsTable";
import { ProposalDialog } from "@/components/ProposalDialog";
import { Proposal } from "@/types/proposal";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";

const Index = () => {
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- ESTADOS DO SISTEMA ---
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | undefined>();

  // 1. Verifica se já existe um usuário logado ao abrir
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Escuta mudanças (ex: se o usuário clicar em sair em outra aba)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carrega propostas APENAS se estiver logado
  useEffect(() => {
    if (session) {
      fetchProposals();
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Bem-vindo de volta!");
    } catch (error: any) {
      toast.error("Erro ao entrar. Verifique email e senha.");
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info("Você saiu do sistema.");
    setProposals([]); // Limpa dados da tela por segurança
  };

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('sent_date', { ascending: false });

      if (error) throw error;

      const formattedProposals: Proposal[] = data.map((p: any) => ({
        id: p.id,
        clientName: p.client_name,
        sentDate: new Date(p.sent_date),
        value: Number(p.value),
        status: p.status,
        sentVia: p.sent_via,
        lastFollowUp: p.last_follow_up ? new Date(p.last_follow_up) : undefined,
        expectedReturnDate: p.expected_return_date ? new Date(p.expected_return_date) : undefined,
        notes: p.notes
      }));

      setProposals(formattedProposals);
    } catch (error) {
      console.error("Erro ao buscar:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de CRUD (Adicionar, Editar, Deletar)
  const handleAddProposal = async (proposal: Omit<Proposal, "id">) => {
    try {
      const { error } = await supabase.from('proposals').insert({
        client_name: proposal.clientName,
        sent_date: proposal.sentDate.toISOString(),
        value: proposal.value,
        status: proposal.status,
        sent_via: proposal.sentVia,
        last_follow_up: proposal.lastFollowUp?.toISOString(),
        expected_return_date: proposal.expectedReturnDate?.toISOString(),
        notes: proposal.notes
      });

      if (error) throw error;
      toast.success("Salvo com sucesso!");
      fetchProposals();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar.");
    }
  };

  const handleEditProposal = async (proposal: Proposal) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          client_name: proposal.clientName,
          sent_date: proposal.sentDate.toISOString(),
          value: proposal.value,
          status: proposal.status,
          sent_via: proposal.sentVia,
          last_follow_up: proposal.lastFollowUp?.toISOString(),
          expected_return_date: proposal.expectedReturnDate?.toISOString(),
          notes: proposal.notes
        })
        .eq('id', proposal.id);

      if (error) throw error;
      toast.success("Atualizado!");
      fetchProposals();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar.");
    }
  };

  const handleDeleteProposal = async (id: string) => {
    try {
      const { error } = await supabase.from('proposals').delete().eq('id', id);
      if (error) throw error;
      toast.success("Excluído.");
      fetchProposals();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  // --- TELA DE LOGIN (Se não estiver logado) ---
  if (!session) {
    if (authLoading) return null; // Tela branca rápida enquanto verifica sessão
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border">
          <div className="text-center flex flex-col items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <img src={logo} alt="Logo" className="h-12 w-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
            <p className="mt-2 text-sm text-gray-600">
              Entre com suas credenciais da Complementare
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="seu.nome@complementare.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Acessar Sistema"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // --- SISTEMA PRINCIPAL (Se estiver logado) ---
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Complementare Logo" className="h-14 w-auto sm:h-20" />
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-foreground">
                  Controle de Propostas
                </h1>
                <p className="hidden sm:block mt-1 text-sm text-muted-foreground">
                  Gerenciamento de projetos complementares
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2 shadow-md">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Proposta</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleLogout} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando dados...</span>
          </div>
        ) : (
          <>
            <Dashboard proposals={proposals} />
            <ProposalsTable
              proposals={proposals}
              onEdit={(p) => { setEditingProposal(p); setIsDialogOpen(true); }}
              onDelete={handleDeleteProposal}
            />
          </>
        )}
      </main>

      <ProposalDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProposal(undefined);
        }}
        onSave={editingProposal ? handleEditProposal : handleAddProposal}
        proposal={editingProposal}
      />
    </div>
  );
};

export default Index;
