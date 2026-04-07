import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Bitcoin,
  CheckCircle,
  Copy,
  HardDrive,
  RefreshCw,
  Shield,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { type UserProfile, WalletType } from "../types/domain";

interface CarteiraPageProps {
  profile: UserProfile;
}

function satsToBtc(sats: bigint): string {
  const btc = Number(sats) / 100_000_000;
  return btc.toFixed(8);
}

function isValidBitcoinAddress(addr: string): boolean {
  return addr.startsWith("1") || addr.startsWith("3") || addr.startsWith("bc1");
}

export default function CarteiraPage({ profile }: CarteiraPageProps) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [manualAddress, setManualAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [copied, setCopied] = useState(false);

  const clientId = profile.clientId;
  const hasClient = clientId !== undefined && clientId !== null;

  // Fetch ckBTC address
  const {
    data: bitcoinAddressResult,
    isLoading: addressLoading,
    refetch: refetchAddress,
  } = useQuery({
    queryKey: ["clientBitcoinAddress", clientId?.toString()],
    queryFn: async () => {
      if (!actor || !hasClient) return null;
      return actor.getClientBitcoinAddress(clientId!);
    },
    enabled: !!actor && !isFetching && hasClient,
    staleTime: 30000,
    refetchInterval: false,
  });

  // Fetch ckBTC balance
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["ckbtcBalance", clientId?.toString()],
    queryFn: async () => {
      if (!actor || !hasClient) return BigInt(0);
      return actor.getCkBtcBalance(clientId!);
    },
    enabled: !!actor && !isFetching && hasClient,
    staleTime: 30000,
    refetchInterval: false,
  });

  // Generate ckBTC address mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !hasClient)
        throw new Error("Actor ou cliente não disponível");
      try {
        return await actor.generateCkBtcAddress(clientId!);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(
          msg.includes("reject") || msg.includes("error")
            ? "Não foi possível gerar o endereço ckBTC. Tente novamente mais tarde."
            : `Erro ao gerar endereço: ${msg}`,
        );
      }
    },
    onSuccess: () => {
      toast.success("Endereço ckBTC gerado com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["clientBitcoinAddress", clientId?.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["ckbtcBalance", clientId?.toString()],
      });
      refetchAddress();
    },
    onError: (err: Error) => {
      toast.error(
        err.message ||
          "Não foi possível gerar o endereço ckBTC. Tente novamente.",
      );
    },
  });

  // Save manual address mutation
  const saveManualMutation = useMutation({
    mutationFn: async (address: string) => {
      if (!actor || !hasClient)
        throw new Error("Actor ou cliente não disponível");
      return actor.setClientBitcoinAddress(
        clientId!,
        address,
        WalletType.manual,
      );
    },
    onSuccess: () => {
      toast.success("Endereço externo salvo com sucesso!");
      setManualAddress("");
      queryClient.invalidateQueries({
        queryKey: ["clientBitcoinAddress", clientId?.toString()],
      });
      refetchAddress();
    },
    onError: () => {
      toast.error("Erro ao salvar endereço. Tente novamente.");
    },
  });

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Endereço copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o endereço.");
    }
  };

  const handleSaveManual = () => {
    setAddressError("");
    if (!manualAddress.trim()) {
      setAddressError("Insira um endereço Bitcoin válido.");
      return;
    }
    if (!isValidBitcoinAddress(manualAddress.trim())) {
      setAddressError("Endereço inválido. Deve começar com 1, 3 ou bc1.");
      return;
    }
    saveManualMutation.mutate(manualAddress.trim());
  };

  const ckbtcAddress =
    bitcoinAddressResult?.walletType === WalletType.ckbtc
      ? bitcoinAddressResult.address
      : null;

  const externalAddress =
    bitcoinAddressResult?.walletType === WalletType.manual
      ? bitcoinAddressResult.address
      : null;

  if (!hasClient) {
    return (
      <div className="p-6">
        <div
          data-ocid="carteira.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/30 border border-border flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            Nenhuma empresa vinculada
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Nenhuma empresa está vinculada ao seu perfil. Entre em contato com o
            administrador para solicitar o acesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <Bitcoin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Carteira Bitcoin
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus endereços Bitcoin e saldo ckBTC
          </p>
        </div>
      </div>

      <Tabs defaultValue="ckbtc" className="space-y-4">
        <TabsList
          data-ocid="carteira.tab"
          className="grid w-full grid-cols-2 bg-card border border-border"
        >
          <TabsTrigger
            value="ckbtc"
            data-ocid="carteira.ckbtc.tab"
            className="gap-2"
          >
            <Bitcoin className="h-4 w-4" />
            ckBTC (Custodial)
          </TabsTrigger>
          <TabsTrigger
            value="externa"
            data-ocid="carteira.externa.tab"
            className="gap-2"
          >
            <HardDrive className="h-4 w-4" />
            Cold / Hard Wallet
          </TabsTrigger>
        </TabsList>

        {/* ckBTC Tab */}
        <TabsContent value="ckbtc" className="space-y-4">
          {/* Balance Card */}
          <Card
            data-ocid="carteira.ckbtc.card"
            className="bg-card border-border shadow-card"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Saldo ckBTC
              </CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <div
                  data-ocid="carteira.ckbtc.loading_state"
                  className="space-y-2"
                >
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-display font-bold text-foreground">
                    {satsToBtc(balance ?? BigInt(0))}
                    <span className="text-lg text-primary ml-2">BTC</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Number(balance ?? BigInt(0)).toLocaleString("pt-BR")}{" "}
                    satoshis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Endereço ckBTC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-9 w-36" />
                </div>
              ) : ckbtcAddress ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      data-ocid="carteira.ckbtc.input"
                      value={ckbtcAddress}
                      readOnly
                      className="font-mono text-xs bg-muted/30 border-border text-foreground"
                    />
                    <Button
                      data-ocid="carteira.ckbtc.copy.button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(ckbtcAddress)}
                      className="flex-shrink-0 border-border hover:border-primary/50"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    data-ocid="carteira.ckbtc.generate.button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary gap-2"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        generateMutation.isPending ? "animate-spin" : ""
                      }`}
                    />
                    {generateMutation.isPending
                      ? "Gerando..."
                      : "Gerar novo endereço ckBTC"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    data-ocid="carteira.ckbtc.empty_state"
                    className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-xl bg-muted/10"
                  >
                    <Bitcoin className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Nenhum endereço gerado ainda
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Gere um endereço ckBTC exclusivo para receber pagamentos
                      em Bitcoin via ICP.
                    </p>
                  </div>
                  <Button
                    data-ocid="carteira.ckbtc.generate_first.button"
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Bitcoin
                      className={`h-4 w-4 ${
                        generateMutation.isPending ? "animate-pulse" : ""
                      }`}
                    />
                    {generateMutation.isPending
                      ? "Gerando endereço..."
                      : "Gerar endereço ckBTC"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground flex items-start gap-1.5 px-1">
            <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary/60" />
            Endereços ckBTC são gerados e controlados pelo protocolo ICP com
            segurança criptográfica nativa.
          </p>
        </TabsContent>

        {/* Cold / Hard Wallet Tab */}
        <TabsContent value="externa" className="space-y-4">
          <Card
            data-ocid="carteira.externa.card"
            className="bg-card border-border shadow-card"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Endereço Externo Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addressLoading ? (
                <Skeleton
                  data-ocid="carteira.externa.loading_state"
                  className="h-10 w-full"
                />
              ) : externalAddress ? (
                <div className="flex items-center gap-2">
                  <Input
                    data-ocid="carteira.externa.current.input"
                    value={externalAddress}
                    readOnly
                    className="font-mono text-xs bg-muted/30 border-border text-foreground"
                  />
                  <Button
                    data-ocid="carteira.externa.copy.button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(externalAddress)}
                    className="flex-shrink-0 border-border hover:border-primary/50"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  data-ocid="carteira.externa.empty_state"
                  className="flex items-center gap-2 py-3 text-muted-foreground"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">
                    Nenhum endereço externo cadastrado.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cadastrar / Atualizar Endereço Externo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="external-address"
                  className="text-sm text-foreground"
                >
                  Endereço Bitcoin
                </Label>
                <Input
                  id="external-address"
                  data-ocid="carteira.externa.input"
                  placeholder="bc1q... ou 1A1zP... ou 3J98t..."
                  value={manualAddress}
                  onChange={(e) => {
                    setManualAddress(e.target.value);
                    setAddressError("");
                  }}
                  className="font-mono text-xs bg-muted/30 border-border"
                />
                {addressError && (
                  <p
                    data-ocid="carteira.externa.error_state"
                    className="text-xs text-destructive flex items-center gap-1.5"
                  >
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {addressError}
                  </p>
                )}
              </div>

              <Button
                data-ocid="carteira.externa.save.button"
                onClick={handleSaveManual}
                disabled={saveManualMutation.isPending || !manualAddress.trim()}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saveManualMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <HardDrive className="h-4 w-4" />
                )}
                {saveManualMutation.isPending
                  ? "Salvando..."
                  : "Salvar endereço externo"}
              </Button>

              {saveManualMutation.isSuccess && (
                <div
                  data-ocid="carteira.externa.success_state"
                  className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-emerald-400">
                    Endereço externo salvo com sucesso.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 px-1 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400/90">
              <span className="font-semibold">Atenção:</span> Endereços externos
              (cold/hard wallet) não são monitorados automaticamente pelo
              sistema. Você precisará registrar as transações manualmente.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
