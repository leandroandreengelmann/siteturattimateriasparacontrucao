import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

import { Label } from "@/components/ui/label";
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function DesignSystemPage() {
    return (
        <div className="container py-10 space-y-12">
            <section className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight">Turatti Design System</h1>
                <p className="text-muted-foreground text-lg">
                    Tokens semânticos, componentes base e decisões visuais baseadas na identidade #004EEB.
                </p>
            </section>

            {/* Cores */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Cores Semânticas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <div className="h-16 w-full rounded-md bg-primary border" />
                        <p className="text-sm font-medium">Primary (#004EEB)</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-16 w-full rounded-md bg-success border" />
                        <p className="text-sm font-medium">Success</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-16 w-full rounded-md bg-warning border" />
                        <p className="text-sm font-medium">Warning</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-16 w-full rounded-md bg-error border" />
                        <p className="text-sm font-medium">Error / Destructive</p>
                    </div>
                </div>
            </section>

            {/* Tipografia */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Tipografia (Inter)</h2>
                <div className="space-y-4 border p-6 rounded-lg">
                    <h1 className="text-5xl font-extrabold">Heading 1 - Extra Bold</h1>
                    <h2 className="text-4xl font-bold">Heading 2 - Bold</h2>
                    <h3 className="text-3xl font-semibold">Heading 3 - Semi Bold</h3>
                    <p className="text-base text-foreground">
                        Corpo de texto padrão. A fonte Inter oferece excelente legibilidade em todos os tamanhos,
                        mantendo um ar técnico e moderno para o projeto Turatti.
                    </p>
                    <p className="text-sm text-muted-foreground">Texto auxiliar (Muted) - Small</p>
                </div>
            </section>

            {/* Componentes */}
            <section className="space-y-8">
                <h2 className="text-2xl font-bold">Componentes Base</h2>

                <div className="grid gap-8">
                    {/* Buttons & Badges */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ações e Badges</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <div className="space-y-4 w-full">
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="default">Primary Button</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="outline" className="border-success text-success hover:bg-success/10">Success</Button>
                                    <Button variant="outline" className="border-warning text-warning hover:bg-warning/10">Warning</Button>
                                    <Button variant="destructive">Destructive</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="default">Default</Badge>
                                    <Badge variant="secondary">Secondary</Badge>
                                    <Badge variant="success">Success</Badge>
                                    <Badge variant="warning">Warning</Badge>
                                    <Badge variant="destructive">Destructive</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Forms */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Entradas de Dados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ds-input">Label do Campo</Label>
                                    <Input id="ds-input" placeholder="Digite algo..." />
                                </div>
                                <div className="flex items-center space-x-2 h-full pt-6">
                                    <Checkbox id="terms" />
                                    <Label htmlFor="terms">Aceito os termos e condições</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feedback */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Feedback e Estados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert variant="default" className="border-success text-success bg-success/5">
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Operação concluída</AlertTitle>
                                <AlertDescription>
                                    Seus dados foram salvos com sucesso no sistema Turatti.
                                </AlertDescription>
                            </Alert>
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>Erro crítico</AlertTitle>
                                <AlertDescription>
                                    Não foi possível processar sua solicitação no momento.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="pt-10 border-t">
                <p className="text-center text-muted-foreground text-sm">
                    Turatti Experience © 2026 - Desenvolvido com Antigravity Design System
                </p>
            </section>
        </div>
    );
}
