import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Construction } from "lucide-react";
import { motion } from "motion/react";

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

export default function ContabilidadePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <BookOpen className="h-5 w-5" />
        <span className="text-sm">Contabilidade</span>
      </div>

      <Tabs defaultValue="plano" data-ocid="contabilidade.tab">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="plano" data-ocid="contabilidade.tab">
            Plano de Contas
          </TabsTrigger>
          <TabsTrigger value="lancamentos" data-ocid="contabilidade.tab">
            Lançamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plano" className="mt-4">
          <EmptyState
            titulo="Nenhum dado disponível"
            descricao="O Plano de Contas está em desenvolvimento. Os dados aparecerão aqui assim que o módulo de contabilidade for implementado no backend."
          />
        </TabsContent>

        <TabsContent value="lancamentos" className="mt-4">
          <EmptyState
            titulo="Nenhum dado disponível"
            descricao="Os Lançamentos Contábeis estão em desenvolvimento. Os registros aparecerão aqui assim que o módulo de contabilidade for implementado no backend."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
