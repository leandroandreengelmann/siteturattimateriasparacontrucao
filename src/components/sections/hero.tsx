import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-background pt-16 pb-24 lg:pt-32 lg:pb-32">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] size-[40%] rounded-full bg-brand-700/5 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] size-[30%] rounded-full bg-brand-700/10 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col items-center text-center">
                    <Badge variant="outline" className="mb-6 px-3 py-1 text-brand-700 border-brand-200 bg-brand-50 animate-fade-in">
                        <span className="flex items-center gap-2">
                            <Zap className="size-3.5 fill-brand-700" />
                            Nova versão 2.0 disponível
                        </span>
                    </Badge>

                    <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                        A infraestrutura de <span className="text-brand-700">pagamentos</span> para a nova economia
                    </h1>

                    <p className="mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        Escalone sua operação com uma API robusta, checkout de alta conversão e inteligência antifraude de última geração. Tudo em uma única plataforma.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="h-12 px-8 text-base">
                            Começar Agora
                            <ArrowRight className="ml-2 size-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                            Falar com Especialista
                        </Button>
                    </div>

                    <div className="mt-20 w-full max-w-5xl rounded-2xl border bg-card/50 p-2 shadow-2xl backdrop-blur-sm">
                        <div className="rounded-xl border bg-background p-4 shadow-inner">
                            <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <div className="flex gap-1.5">
                                    <div className="size-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="size-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                    <div className="size-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                </div>
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Live Dashboard</div>
                                <div className="size-3" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard icon={<BarChart3 className="size-5 text-brand-700" />} label="Vendas Hoje" value="R$ 142.580" change="+12.5%" />
                                <StatCard icon={<Zap className="size-5 text-brand-700" />} label="Tempo de Resposta" value="84ms" change="Estável" />
                                <StatCard icon={<ShieldCheck className="size-5 text-brand-700" />} label="Segurança" value="Nível 1 PCI" change="Ativo" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function StatCard({ icon, label, value, change }: { icon: React.ReactNode, label: string, value: string, change: string }) {
    return (
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-background border shadow-sm">
                    {icon}
                </div>
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold">{value}</span>
                <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    change?.startsWith("+") ? "bg-success/10 text-success" : "bg-brand-50 text-brand-700"
                )}>{change}</span>
            </div>
        </div>
    )
}
