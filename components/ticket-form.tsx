"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Package, AlertTriangle, Loader2, Upload, X } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  type: z.enum(["request", "incident"], {
    required_error: "Selecione o tipo de chamado.",
  }),
  title: z
    .string()
    .min(5, "O título deve ter pelo menos 5 caracteres.")
    .max(100, "O título deve ter no máximo 100 caracteres.")
    .refine((val) => val.trim().length > 0, "O título não pode estar vazio."),
  description: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres.")
    .max(2000, "A descrição deve ter no máximo 2000 caracteres.")
    .refine((val) => val.trim().length > 0, "A descrição não pode estar vazia."),
  priority: z.string({
    required_error: "Selecione uma prioridade.",
  }),
  category: z.string({
    required_error: "Selecione uma categoria.",
  }),
  impact: z.string().optional(),
  urgency: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

interface AttachmentFile {
  id: string
  name: string
  size: number
  type: string
}

export default function TicketForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentFile[]>([])
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "request",
      title: "",
      description: "",
      priority: "",
      category: "",
      attachments: [],
    },
    mode: "onChange", // Enable real-time validation
  })

  const watchType = form.watch("type")
  const watchTitle = form.watch("title")
  const watchDescription = form.watch("description")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log(values)
      setIsSubmitted(true)

      toast({
        title: "Chamado enviado com sucesso!",
        description: `Seu ${watchType === "incident" ? "incidente" : "chamado"} foi registrado e você receberá atualizações por e-mail.`,
        variant: "default",
      })

      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        form.reset()
        setAttachments([])
      }, 5000)
    } catch (error) {
      toast({
        title: "Erro ao enviar chamado",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newAttachments: AttachmentFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo ${file.name} excede o limite de 10MB.`,
          variant: "destructive",
        })
        continue
      }

      // Validate file type
      const allowedTypes = [
        "image/",
        "application/pdf",
        "text/",
        "application/msword",
        "application/vnd.openxmlformats-officedocument",
      ]
      const isAllowed = allowedTypes.some((type) => file.type.startsWith(type))

      if (!isAllowed) {
        toast({
          title: "Tipo de arquivo não permitido",
          description: `O arquivo ${file.name} não é um tipo permitido.`,
          variant: "destructive",
        })
        continue
      }

      newAttachments.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      })
    }

    if (attachments.length + newAttachments.length > 5) {
      toast({
        title: "Muitos arquivos",
        description: "Você pode anexar no máximo 5 arquivos.",
        variant: "destructive",
      })
      return
    }

    setAttachments((prev) => [...prev, ...newAttachments])
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-supportbox/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="bg-supportbox/20 p-3 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-supportbox" />
            </div>
            <h3 className="text-xl font-semibold">
              {watchType === "incident" ? "Incidente Reportado com Sucesso" : "Solicitação Enviada com Sucesso"}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {watchType === "incident"
                ? "Seu incidente foi reportado para a equipe de TI. Você receberá atualizações por e-mail e pode acompanhar o progresso na aba 'Meus Chamados'."
                : "Sua solicitação foi enviada para a equipe de TI. Você receberá atualizações por e-mail e pode acompanhar o progresso na aba 'Meus Chamados'."}
            </p>
            <div className="text-sm text-muted-foreground">
              ID do Chamado: <span className="font-mono font-medium">T-{Math.random().toString().substr(2, 4)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-supportbox/20">
      <CardHeader className="border-b border-supportbox/10">
        <div className="flex items-center gap-2">
          {watchType === "incident" ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <Package className="h-5 w-5 text-supportbox" />
          )}
          <CardTitle>
            {watchType === "incident" ? "Reportar um Incidente" : "Enviar uma Solicitação de Suporte"}
          </CardTitle>
        </div>
        <CardDescription>
          {watchType === "incident"
            ? "Reporte um problema ou falha que esteja afetando seu trabalho."
            : "Solicite um novo serviço, acesso ou informação da equipe de TI."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Chamado *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="request" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex items-center">
                          <Package className="h-4 w-4 mr-2 text-supportbox" />
                          Solicitação
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="incident" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                          Incidente
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    {watchType === "incident"
                      ? "Selecione Incidente para reportar problemas ou falhas."
                      : "Selecione Solicitação para pedir novos serviços ou acessos."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do {watchType === "incident" ? "Incidente" : "Chamado"} *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={
                          watchType === "incident"
                            ? "Descreva brevemente o problema"
                            : "Resumo breve da sua solicitação"
                        }
                        {...field}
                        className="border-supportbox/20 focus:ring-supportbox/30"
                        maxLength={100}
                      />
                      <div className="absolute right-3 top-3 text-xs text-muted-foreground">
                        {watchTitle?.length || 0}/100
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>Mantenha curto e descritivo (5-100 caracteres).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-supportbox/20 focus:ring-supportbox/30">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hardware">🖥️ Hardware</SelectItem>
                        <SelectItem value="software">💻 Software</SelectItem>
                        <SelectItem value="network">🌐 Rede</SelectItem>
                        <SelectItem value="email">📧 E-mail</SelectItem>
                        <SelectItem value="access">🔐 Acesso/Permissões</SelectItem>
                        <SelectItem value="other">📋 Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchType === "incident" ? (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="impact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impacto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-supportbox/20 focus:ring-supportbox/30">
                              <SelectValue placeholder="Impacto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">🟢 Baixo</SelectItem>
                            <SelectItem value="medium">🟡 Médio</SelectItem>
                            <SelectItem value="high">🔴 Alto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgência</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-supportbox/20 focus:ring-supportbox/30">
                              <SelectValue placeholder="Urgência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">⏳ Baixa</SelectItem>
                            <SelectItem value="medium">⏰ Média</SelectItem>
                            <SelectItem value="high">🚨 Alta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-supportbox/20 focus:ring-supportbox/30">
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">🟢 Baixa</SelectItem>
                          <SelectItem value="medium">🟡 Média</SelectItem>
                          <SelectItem value="high">🟠 Alta</SelectItem>
                          <SelectItem value="critical">🔴 Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder={
                          watchType === "incident"
                            ? "Por favor, descreva o problema em detalhes..."
                            : "Por favor, forneça detalhes sobre sua solicitação..."
                        }
                        className="min-h-[120px] border-supportbox/20 focus:ring-supportbox/30 resize-none"
                        maxLength={2000}
                        {...field}
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                        {watchDescription?.length || 0}/2000
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {watchType === "incident"
                      ? "Inclua mensagens de erro, quando o problema começou e passos para reproduzir (10-2000 caracteres)."
                      : "Inclua detalhes relevantes para sua solicitação (10-2000 caracteres)."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Anexos (Opcional)</FormLabel>
                <div className="text-xs text-muted-foreground">Máximo 5 arquivos, 10MB cada</div>
              </div>

              <div className="border-2 border-dashed border-supportbox/20 rounded-lg p-6 text-center hover:border-supportbox/40 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={attachments.length >= 5}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    attachments.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium text-supportbox">Clique para enviar</span> ou arraste arquivos aqui
                  </div>
                  <div className="text-xs text-muted-foreground">PNG, JPG, PDF, DOC, TXT até 10MB</div>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Arquivos anexados:</div>
                  {attachments.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="text-xs">📎</div>
                        <div>
                          <div className="text-sm font-medium truncate max-w-[200px]">{file.name}</div>
                          <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(file.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                watchType === "incident" ? "bg-red-500 hover:bg-red-600" : "bg-supportbox hover:bg-supportbox-dark"
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : watchType === "incident" ? (
                "Reportar Incidente"
              ) : (
                "Enviar Solicitação"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
