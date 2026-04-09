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
  Building2,
  CheckCircle,
  Copy,
  HardDrive,
  RefreshCw,
  Shield,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PageName } from "../App";
import { useActor } from "../hooks/useActor";
import { type UserProfile, WalletType } from "../types/domain";

interface CarteiraPageProps {
  profile: UserProfile;
  onNavigate?: (page: PageName) => void;
}

function satsToBtc(sats: bigint): string {
  const btc = Number(sats) / 100_000_000;
  return btc.toFixed(8);
}

function isValidBitcoinAddress(addr: string): boolean {
  return addr.startsWith("1") || addr.startsWith("3") || addr.startsWith("bc1");
}

export default function CarteiraPage({
  profile,
  onNavigate,
}: CarteiraPageProps) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [manualAddress, setManualAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [copied, setCopied] = useState(false);
  // For users without clientId — store directly on profile
  const [profileWallet, setProfileWallet] = useState(
    profile.companyWallet ?? "",
  );
  const [profileWalletError, setProfileWalletError] = useState("");

  const clientId = profile.clientId;
  const hasClient = clientId !== undefined && clientId !== null;

  // Fetch ckBTC address (only when clientId exists)
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

  // Fetch ckBTC balance (only when clientId exists)
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

  // Generate ckBTC address mutation (requires clientId)
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

  // Save manual address mutation (requires clientId)
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

  // Save wallet directly on profile (for users without clientId)
  const saveProfileWalletMutation = useMutation({
    mutationFn: async (address: string) => {
      if (!actor) throw new Error("Actor não disponível");
      return actor.saveCallerUserProfile({
        ...profile,
        companyWallet: address,
      });
    },
    onSuccess: () => {
      toast.success("Endereço Bitcoin salvo no seu perfil!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
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

  const handleSaveProfileWallet = () => {
    setProfileWalletError("");
    if (!profileWallet.trim()) {
      setProfileWalletError("Insira um endereço Bitcoin válido.");
      return;
    }
    if (!isValidBitcoinAddress(profileWallet.trim())) {
      setProfileWalletError("Endereço inválido. Deve começar com 1, 3 ou bc1.");
      return;
    }
    saveProfileWalletMutation.mutate(profileWallet.trim());
  };

  const ckbtcAddress =
    bitcoinAddressResult?.walletType === WalletType.ckbtc
      ? bitcoinAddressResult.address
      : null;

  const externalAddress =
    bitcoinAddressResult?.walletType === WalletType.manual
      ? bitcoinAddressResult.address
      : null;

  const hasCompanyRegistered = !!(profile.companyName && profile.cnpj);

  // No clientId: show guidance depending on whether company is registered
  if (!hasClient) {
    return (
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Bitcoin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Carteira Bitcoin
            </h2>
            <p className="text-sm text-muted-foreground">
              Gerencie seu endereço Bitcoin
            </p>
          </div>
        </div>

        {/* Branch A: Company NOT yet registered — prompt to register */}
        {!hasCompanyRegistered && (
          <>
            <div
              data-ocid="carteira.no_company.banner"
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Building2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-300">
                    Cadastre sua empresa primeiro
                  </p>
                  <p className="text-xs text-blue-400/80 mt-0.5">
                    Para gerar endereços ckBTC e monitorar saldo
                    automaticamente, você precisa cadastrar os dados da sua
                    empresa no SatAuditor.
                  </p>
                </div>
              </div>
              {onNavigate && (
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid="carteira.register_company_btn"
                  onClick={() => onNavigate("minha-empresa")}
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 shrink-0 gap-2"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Cadastrar Minha Empresa
                </Button>
              )}
            </div>

            {/* Still allow manual profile-level wallet entry */}
            <Card
              data-ocid="carteira.profile_wallet.card"
              className="bg-card border-border shadow-card"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Endereço Bitcoin (Temporário)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.companyWallet && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Endereço atual
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        data-ocid="carteira.profile_wallet.current_input"
                        value={profile.companyWallet}
                        readOnly
                        className="font-mono text-xs bg-muted/30 border-border text-foreground"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(profile.companyWallet!)}
                        className="flex-shrink-0 border-border hover:border-primary/50"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-wallet"
                    className="text-sm text-foreground"
                  >
                    {profile.companyWallet
                      ? "Atualizar endereço"
                      : "Adicionar endereço Bitcoin"}
                  </Label>
                  <Input
                    id="profile-wallet"
                    data-ocid="carteira.profile_wallet.input"
                    placeholder="bc1q... ou 1A1zP... ou 3J98t..."
                    value={profileWallet}
                    onChange={(e) => {
                      setProfileWallet(e.target.value);
                      setProfileWalletError("");
                    }}
                    className="font-mono text-xs bg-muted/30 border-border"
                  />
                  {profileWalletError && (
                    <p className="text-xs text-destructive flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {profileWalletError}
                    </p>
                  )}
                </div>
                <Button
                  data-ocid="carteira.profile_wallet.save_btn"
                  onClick={handleSaveProfileWallet}
                  disabled={
                    saveProfileWalletMutation.isPending || !profileWallet.trim()
                  }
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {saveProfileWalletMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  {saveProfileWalletMutation.isPending
                    ? "Salvando..."
                    : "Salvar endereço"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Branch B: Company IS registered but no clientId linked yet */}
        {hasCompanyRegistered && (
          <div
            data-ocid="carteira.company_registered.banner"
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-300">
                  Empresa cadastrada: {profile.companyName}
                </p>
                <p className="text-xs text-emerald-400/80 mt-1">
                  Sua empresa está registrada no SatAuditor. Para vincular
                  carteiras Bitcoin e gerar endereços ckBTC, o administrador
                  precisa associar sua conta ao cadastro de cliente no sistema.
                </p>
              </div>
            </div>

            {profile.companyWallet ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Endereço Bitcoin vinculado à empresa
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    data-ocid="carteira.company_wallet.display"
                    value={profile.companyWallet}
                    readOnly
                    className="font-mono text-xs bg-muted/30 border-border text-foreground"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(profile.companyWallet!)}
                    className="flex-shrink-0 border-border hover:border-primary/50"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-400" />
                <span className="text-xs text-amber-400/90">
                  Nenhum endereço Bitcoin vinculado à empresa ainda. Edite os
                  dados em{" "}
                  {onNavigate ? (
                    <button
                      type="button"
                      onClick={() => onNavigate("minha-empresa")}
                      className="underline hover:text-amber-300 transition-colors"
                    >
                      Minha Empresa
                    </button>
                  ) : (
                    "Minha Empresa"
                  )}{" "}
                  para adicionar um.
                </span>
              </div>
            )}

            {onNavigate && (
              <Button
                variant="outline"
                size="sm"
                data-ocid="carteira.edit_company_btn"
                onClick={() => onNavigate("minha-empresa")}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-2"
              >
                <Building2 className="h-3.5 w-3.5" />
                Ver / Editar Empresa
              </Button>
            )}
          </div>
        )}

        <div className="flex items-start gap-2 px-1 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/90">
            <span className="font-semibold">Atenção:</span> Endereços ckBTC e
            monitoramento automático de saldo ficam disponíveis após o
            administrador vincular sua conta ao cadastro de cliente.
          </p>
        </div>
      </div>
    );
  }

  // Has clientId: full wallet management
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
                      className={`h-3.5 w-3.5 ${generateMutation.isPending ? "animate-spin" : ""}`}
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
                      className={`h-4 w-4 ${generateMutation.isPending ? "animate-pulse" : ""}`}
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
