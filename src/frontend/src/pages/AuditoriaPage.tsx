import { Card, CardContent } from "@/components/ui/card";
import { Construction, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function AuditoriaPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-sm">Auditoria</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card border-border shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="rounded-full bg-muted/40 p-4">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground mb-1">
                Nenhum dado disponível
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                O Log de Auditoria está em desenvolvimento. Os registros de
                ações e eventos aparecerão aqui assim que o módulo for
                implementado no backend.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
