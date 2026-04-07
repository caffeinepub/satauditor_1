import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, FileText, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { parseCSV } from "../lib/parsers/csvParser";
import { parseOFX } from "../lib/parsers/ofxParser";
import {
  type ImportRecord,
  TransactionCategory,
  TransactionType,
} from "../types/domain";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewRow {
  id: string; // stable key for list rendering
  date: string;
  description: string;
  value: number; // reais
  type: "income" | "expense";
  category: TransactionCategory;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: TransactionCategory; label: string }[] = [
  { value: TransactionCategory.revenue, label: "Receita" },
  { value: TransactionCategory.cost, label: "Custo" },
  { value: TransactionCategory.operational, label: "Operacional" },
  { value: TransactionCategory.financial, label: "Financeiro" },
  { value: TransactionCategory.other, label: "Outros" },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleString("pt-BR");
}

const SKELETON_ROWS = ["sk1", "sk2", "sk3"] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ImportarExtratoPage() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch import history ───────────────────────────────────────────────────
  const { data: history = [], isLoading: historyLoading } = useQuery<
    ImportRecord[]
  >({
    queryKey: ["importHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getImportHistory() as Promise<ImportRecord[]>;
    },
    enabled: !!actor && !isFetching,
  });

  // ── Import mutation ────────────────────────────────────────────────────────
  const { mutate: confirmImport, isPending: isImporting } = useMutation({
    mutationFn: async (rows: PreviewRow[]) => {
      if (!actor) throw new Error("Ator não disponível");

      const now = BigInt(Date.now()) * 1_000_000n;
      const transactions = rows.map((row, idx) => ({
        id: 0n,
        hash: `import-${Date.now()}-${idx}`,
        transactionType:
          row.type === "income"
            ? ({ income: null } as { income: null })
            : ({ expense: null } as { expense: null }),
        value: BigInt(Math.round(row.value * 1e8)),
        date: now,
        clientId: 0n,
        description: row.description,
        category: { [row.category]: null } as Record<string, null>,
        confirmed: true,
        createdAt: now,
        updatedAt: now,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await actor.importTransactions(
        transactions as any,
        selectedFile?.name ?? "extrato.csv",
      );
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (count) => {
      toast.success(`${count} transações importadas com sucesso!`);
      setPreview(null);
      setSelectedFile(null);
      setParseError(null);
      queryClient.invalidateQueries({ queryKey: ["importHistory"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: Error) => {
      toast.error(`Erro ao importar: ${err.message}`);
    },
  });

  // ── File processing ────────────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setParseError(null);
    setPreview(null);
    setSelectedFile(file);

    const name = file.name.toLowerCase();
    if (
      !name.endsWith(".csv") &&
      !name.endsWith(".ofx") &&
      !name.endsWith(".qfx")
    ) {
      setParseError("Formato inválido. Use arquivos .csv, .ofx ou .qfx.");
      return;
    }

    try {
      const text = await file.text();
      let parsed: {
        date: string;
        description: string;
        value: number;
        type: "income" | "expense";
      }[];

      if (name.endsWith(".csv")) {
        parsed = parseCSV(text);
      } else {
        parsed = parseOFX(text);
      }

      if (parsed.length === 0) {
        setParseError(
          "Nenhuma transação encontrada no arquivo. Verifique o formato.",
        );
        return;
      }

      const rows: PreviewRow[] = parsed.map((p, i) => ({
        id: `row-${i}-${p.date}-${p.value}`,
        ...p,
        category:
          p.type === "income"
            ? TransactionCategory.revenue
            : TransactionCategory.operational,
      }));
      setPreview(rows);
    } catch {
      setParseError(
        "Não foi possível ler o arquivo. Verifique se está correto e tente novamente.",
      );
    }
  }, []);

  // ── Drag & drop handlers ───────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const updatePreviewRow = (
    id: string,
    field: keyof PreviewRow,
    value: string,
  ) => {
    setPreview((prev) => {
      if (!prev) return prev;
      return prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      );
    });
  };

  const clearPreview = () => {
    setPreview(null);
    setSelectedFile(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Upload Section ── */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Importar Extrato Bancário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <button
            type="button"
            data-ocid="importar.dropzone"
            aria-label="Selecionar arquivo para importar"
            onDragOver={(e: React.DragEvent) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.ofx,.qfx"
              className="sr-only"
              onChange={handleFileChange}
              data-ocid="importar.file_input"
            />
            <Upload
              className={`h-10 w-10 mx-auto mb-3 transition-colors ${
                dragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <p className="font-medium text-foreground mb-1">
              {dragging
                ? "Solte o arquivo aqui"
                : "Arraste e solte ou clique para selecionar"}
            </p>
            <p className="text-sm text-muted-foreground">
              Suporta arquivos{" "}
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                CSV
              </span>{" "}
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                OFX
              </span>{" "}
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                QFX
              </span>
            </p>
          </button>

          {/* Selected file info */}
          {selectedFile && !parseError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/40 border border-border">
              <FileText className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={clearPreview}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Remover arquivo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Error message */}
          {parseError && (
            <div
              data-ocid="importar.error_state"
              className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Preview Section ── */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display">
                  Prévia das Transações
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  {preview.length} transações encontradas
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent sticky top-0 bg-card z-10">
                      <TableHead className="text-muted-foreground">
                        Data
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Descrição
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Tipo
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground">
                        Valor (R$)
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Categoria
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row) => (
                      <TableRow
                        key={row.id}
                        data-ocid="importar.preview.item"
                        className="border-b border-border/50 hover:bg-muted/10"
                      >
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(`${row.date}T00:00:00`).toLocaleDateString(
                            "pt-BR",
                          )}
                        </TableCell>
                        <TableCell
                          className="text-sm max-w-[200px] truncate"
                          title={row.description}
                        >
                          {row.description}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            data-ocid="importar.preview.type_toggle"
                            onClick={() =>
                              updatePreviewRow(
                                row.id,
                                "type",
                                row.type === "income" ? "expense" : "income",
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                updatePreviewRow(
                                  row.id,
                                  "type",
                                  row.type === "income" ? "expense" : "income",
                                );
                            }}
                            aria-label={`Tipo: ${row.type === "income" ? "Entrada" : "Saída"}. Clique para alternar.`}
                          >
                            <Badge
                              variant="outline"
                              className={`text-xs cursor-pointer ${
                                row.type === "income"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : "bg-red-500/15 text-red-400 border-red-500/30"
                              }`}
                            >
                              {row.type === "income" ? "Entrada" : "Saída"}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(row.value)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.category}
                            onValueChange={(v) =>
                              updatePreviewRow(row.id, "category", v)
                            }
                          >
                            <SelectTrigger
                              data-ocid="importar.preview.category_select"
                              className="h-7 text-xs w-36 bg-background border-border"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 p-4 border-t border-border">
                <Button
                  data-ocid="importar.cancel_button"
                  variant="outline"
                  className="border-border"
                  onClick={clearPreview}
                  disabled={isImporting}
                >
                  Cancelar
                </Button>
                <Button
                  data-ocid="importar.confirm_button"
                  onClick={() => confirmImport(preview)}
                  disabled={isImporting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isImporting
                    ? "Importando..."
                    : `Confirmar Importação (${preview.length})`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── History Section ── */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Histórico de Importações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">
                  Data da Importação
                </TableHead>
                <TableHead className="text-muted-foreground">Arquivo</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Registros
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Importado por
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoading ? (
                SKELETON_ROWS.map((key) => (
                  <TableRow
                    key={key}
                    data-ocid="importar.history.loading_state"
                    className="border-border/50"
                  >
                    <TableCell>
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-10 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                  </TableRow>
                ))
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell
                    data-ocid="importar.history.empty_state"
                    colSpan={4}
                    className="text-center text-muted-foreground py-10"
                  >
                    Nenhuma importação realizada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((record, i) => (
                  <motion.tr
                    key={record.id.toString()}
                    data-ocid={`importar.history.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimestamp(record.importedAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate max-w-[160px]">
                          {record.filename}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {record.recordCount.toString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">
                      {record.importedBy.toString().slice(0, 12)}…
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
