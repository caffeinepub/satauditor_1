import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Construction, Download } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function EmptyState({
  titulo,
  descricao,
}: { titulo: string; descricao: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card border-border shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="rounded-full bg-muted/40 p-4">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground mb-1">
              {titulo}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {descricao}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function RelatoriosPage() {
  const [mes, setMes] = useState("3");
  const [ano, setAno] = useState("2026");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <BarChart3 className="h-5 w-5" />
        <span className="text-sm">Relatórios Financeiros</span>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Período:</span>
        <Select value={mes} onValueChange={setMes}>
          <SelectTrigger
            data-ocid="relatorios.select"
            className="w-36 bg-card border-border"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MESES.map((m, i) => (
              <SelectItem key={m} value={String(i)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ano} onValueChange={setAno}>
          <SelectTrigger
            data-ocid="relatorios.select"
            className="w-24 bg-card border-border"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
        <Button
          data-ocid="relatorios.secondary_button"
          variant="outline"
          size="sm"
          className="border-border"
          disabled
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Tabs defaultValue="balanco" data-ocid="relatorios.tab">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="balanco" data-ocid="relatorios.tab">
            Balanço Patrimonial
          </TabsTrigger>
          <TabsTrigger value="dre" data-ocid="relatorios.tab">
            DRE
          </TabsTrigger>
          <TabsTrigger value="fluxo" data-ocid="relatorios.tab">
            Fluxo de Caixa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balanco" className="mt-4">
          <EmptyState
            titulo="Nenhum dado disponível"
            descricao="O Balanço Patrimonial está em desenvolvimento. Os dados aparecerão aqui assim que o módulo de relatórios for implementado no backend."
          />
        </TabsContent>

        <TabsContent value="dre" className="mt-4">
          <EmptyState
            titulo="Nenhum dado disponível"
            descricao={`A DRE de ${MESES[Number.parseInt(mes)]}/${ano} está em desenvolvimento. Os dados aparecerão aqui assim que o módulo de relatórios for implementado no backend.`}
          />
        </TabsContent>

        <TabsContent value="fluxo" className="mt-4">
          <EmptyState
            titulo="Nenhum dado disponível"
            descricao="O Fluxo de Caixa está em desenvolvimento. Os dados aparecerão aqui assim que o módulo de relatórios for implementado no backend."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
