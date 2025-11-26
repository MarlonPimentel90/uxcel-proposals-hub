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
import { Edit, Trash2, Search, AlertCircle, ArrowUpDown } from "lucide-react";
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

type SortField = "status" | "lastFollowUp" | "expectedReturnDate";
type SortDirection = "asc" | "desc";

export const ProposalsTable = ({
  proposals,
  onEdit,
  onDelete,
}: ProposalsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const getStatusBadge = (status: ProposalStatus) => {
    const statusConfig = {
      pending: {
        label: "Aguardando",
        variant: "outline" as const,
        className: "border-alert-attention bg-alert-attention/10 text-alert-attention font-medium",
      },
      approved: {
        label: "Aprovada",
        variant: "outline" as const,
        className: "border-success bg-success/10 text-success font-medium",
      },
      rejected: {
        label: "Recusada",
        variant: "outline" as const,
        className: "border-destructive bg-destructive/10 text-destructive font-medium",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return "-";
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

  const getDaysUntilReturn = (date?: Date) => {
    if (!date) return null;
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const needsFollowUp = (proposal: Proposal) => {
    return (
      proposal.status === "pending" && getDaysSinceFollowUp(proposal.lastFollowUp) > 7
    );
  };

  const isReturnOverdue = (proposal: Proposal) => {
    if (!proposal.expectedReturnDate) return false;
    const daysUntil = getDaysUntilReturn(proposal.expectedReturnDate);
    return daysUntil !== null && daysUntil < 0;
  };

  const isReturnSoon = (proposal: Proposal) => {
    if (!proposal.expectedReturnDate) return false;
    const daysUntil = getDaysUntilReturn(proposal.expectedReturnDate);
    return daysUntil !== null && daysUntil >= 0 && daysUntil <= 3;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProposals = proposals.filter((proposal) =>
    proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProposals = [...filteredProposals].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;

    if (sortField === "status") {
      const statusOrder = { pending: 0, approved: 1, rejected: 2 };
      comparison = statusOrder[a.status] - statusOrder[b.status];
    } else if (sortField === "lastFollowUp") {
      comparison = a.lastFollowUp.getTime() - b.lastFollowUp.getTime();
    } else if (sortField === "expectedReturnDate") {
      const aDate = a.expectedReturnDate?.getTime() ?? Infinity;
      const bDate = b.expectedReturnDate?.getTime() ?? Infinity;
      comparison = aDate - bDate;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-table-header hover:bg-table-header border-b-0">
                <TableHead className="text-table-header-foreground font-semibold">Cliente</TableHead>
                <TableHead className="text-table-header-foreground font-semibold">Data de Envio</TableHead>
                <TableHead className="text-table-header-foreground font-semibold">Valor</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 text-table-header-foreground hover:text-table-header-foreground hover:bg-table-header-foreground/10 font-semibold"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 text-table-header-foreground hover:text-table-header-foreground hover:bg-table-header-foreground/10 font-semibold"
                    onClick={() => handleSort("lastFollowUp")}
                  >
                    Último Follow-up
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 text-table-header-foreground hover:text-table-header-foreground hover:bg-table-header-foreground/10 font-semibold"
                    onClick={() => handleSort("expectedReturnDate")}
                  >
                    Previsão de Retorno
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-table-header-foreground font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhuma proposta encontrada
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedProposals.map((proposal) => {
                  const isOverdue = isReturnOverdue(proposal);
                  const isSoon = isReturnSoon(proposal);
                  const needsAlert = needsFollowUp(proposal);
                  
                  let rowClassName = "";
                  if (isOverdue) {
                    rowClassName = "bg-alert-overdue/5 hover:bg-alert-overdue/10 border-l-4 border-l-alert-overdue";
                  } else if (isSoon) {
                    rowClassName = "bg-alert-soon/5 hover:bg-alert-soon/10 border-l-4 border-l-alert-soon";
                  } else if (needsAlert) {
                    rowClassName = "bg-alert-attention/5 hover:bg-alert-attention/10 border-l-2 border-l-alert-attention";
                  }

                  return (
                    <TableRow key={proposal.id} className={rowClassName}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isOverdue && (
                            <AlertCircle className="h-4 w-4 text-alert-overdue" />
                          )}
                          {isSoon && !isOverdue && (
                            <AlertCircle className="h-4 w-4 text-alert-soon" />
                          )}
                          {needsAlert && !isOverdue && !isSoon && (
                            <AlertCircle className="h-4 w-4 text-alert-attention" />
                          )}
                          {proposal.clientName}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(proposal.sentDate)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(proposal.value)}
                      </TableCell>
                      <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className={needsAlert ? "font-medium" : ""}>
                            {formatDate(proposal.lastFollowUp)}
                          </p>
                          {needsAlert && (
                            <p className="text-xs text-alert-attention mt-1 font-medium italic">
                              Há {getDaysSinceFollowUp(proposal.lastFollowUp)} dias sem follow-up
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {proposal.expectedReturnDate ? (
                          <div>
                            <p className={isOverdue || isSoon ? "font-semibold" : ""}>
                              {formatDate(proposal.expectedReturnDate)}
                            </p>
                            {isOverdue && (
                              <p className="text-xs text-alert-overdue mt-1 font-bold">
                                ⚠ Vencido há {Math.abs(getDaysUntilReturn(proposal.expectedReturnDate)!)} dias
                              </p>
                            )}
                            {isSoon && !isOverdue && (
                              <p className="text-xs text-alert-soon mt-1 font-semibold">
                                📅 Em {getDaysUntilReturn(proposal.expectedReturnDate)} dias
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-sm">Não definida</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(proposal)}
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(proposal.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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