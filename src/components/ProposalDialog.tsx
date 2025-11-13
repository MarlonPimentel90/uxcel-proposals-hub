import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Proposal, ProposalStatus } from "@/types/proposal";

const proposalSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  projectType: z.string().min(1, "Tipo de projeto é obrigatório"),
  sentDate: z.string(),
  value: z.coerce.number().min(0, "Valor deve ser maior que zero"),
  status: z.enum(["pending", "approved", "rejected"]),
  lastFollowUp: z.string(),
  notes: z.string(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface ProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (proposal: Proposal | Omit<Proposal, "id">) => void;
  proposal?: Proposal;
}

export const ProposalDialog = ({
  open,
  onOpenChange,
  onSave,
  proposal,
}: ProposalDialogProps) => {
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      clientName: "",
      projectType: "",
      sentDate: new Date().toISOString().split("T")[0],
      value: 0,
      status: "pending",
      lastFollowUp: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  useEffect(() => {
    if (proposal) {
      form.reset({
        clientName: proposal.clientName,
        projectType: proposal.projectType,
        sentDate: proposal.sentDate.toISOString().split("T")[0],
        value: proposal.value,
        status: proposal.status,
        lastFollowUp: proposal.lastFollowUp.toISOString().split("T")[0],
        notes: proposal.notes,
      });
    } else {
      form.reset({
        clientName: "",
        projectType: "",
        sentDate: new Date().toISOString().split("T")[0],
        value: 0,
        status: "pending",
        lastFollowUp: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [proposal, form, open]);

  const onSubmit = (data: ProposalFormValues) => {
    const proposalData: Omit<Proposal, "id"> = {
      clientName: data.clientName,
      projectType: data.projectType,
      value: data.value,
      status: data.status,
      notes: data.notes,
      sentDate: new Date(data.sentDate),
      lastFollowUp: new Date(data.lastFollowUp),
    };

    if (proposal) {
      onSave({ ...proposalData, id: proposal.id } as Proposal);
    } else {
      onSave(proposalData);
    }

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {proposal ? "Editar Proposta" : "Nova Proposta"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Construtora ABC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Projeto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Estrutural" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Envio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Aguardando</SelectItem>
                        <SelectItem value="approved">Aprovada</SelectItem>
                        <SelectItem value="rejected">Recusada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastFollowUp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Último Follow-up</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre a proposta..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {proposal ? "Salvar Alterações" : "Criar Proposta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
