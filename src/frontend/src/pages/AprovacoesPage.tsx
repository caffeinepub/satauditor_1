import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

// Access approval workflow has been removed.
// All authenticated users have immediate access to the platform.
export default function AprovacoesPage(_props: { actor?: unknown }) {
  return (
    <div className="p-6">
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          <p className="text-base font-semibold text-foreground">
            Acesso liberado para todos os usuários
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            O sistema de aprovação está desativado. Qualquer usuário autenticado
            tem acesso imediato à plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
