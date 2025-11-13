import { useState } from "react";
import { Proposal, ProposalStatus } from "@/types/proposal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProposalsTableProps {
  proposals: Proposal[];
  onEdit: (proposal: Proposal) => void;
  onDelete: (id: string) => void;
}

export const ProposalsTable = ({
  proposals,
  onEdit,
  onDelete,
}: ProposalsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStatusBadge = (status: ProposalStatus) => {
    const statusConfig = {
      pending: {
        label: "Aguardando",
        variant: "outline" as const,
        className: "border-warning text-warning",
      },
      approved: {
        label: "Aprovada",
        variant: "outline" as const,
        className: "border-success text-success",
      },
      rejected: {
        label: "Recusada",
        variant: "outline" as const,
        className: "border-destructive text-destructive",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getDaysSinceFollowUp = (date: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const needsFollowUp = (proposal: Proposal) => {
    return (
      proposal.status === "pending" && getDaysSinceFollowUp(proposal.lastFollowUp) > 7
    );
  };

  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.projectType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou tipo de projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo de Projeto</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Follow-up</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhuma proposta encontrada
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map((proposal) => (
                  <TableRow
                    key={proposal.id}
                    className={
                      needsFollowUp(proposal)
                        ? "bg-warning/5 hover:bg-warning/10"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {needsFollowUp(proposal) && (
                          <AlertCircle className="h-4 w-4 text-warning" />
                        )}
                        {proposal.clientName}
                      </div>
                    </TableCell>
                    <TableCell>{proposal.projectType}</TableCell>
                    <TableCell>{formatDate(proposal.sentDate)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(proposal.value)}
                    </TableCell>
                    <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p>{formatDate(proposal.lastFollowUp)}</p>
                        {needsFollowUp(proposal) && (
                          <p className="text-xs text-warning mt-1">
                            Há {getDaysSinceFollowUp(proposal.lastFollowUp)} dias
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(proposal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(proposal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta proposta? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
