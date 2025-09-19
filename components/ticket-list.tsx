"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MessageSquare, Package, Search, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"

// Dados fictícios para chamados
const mockTickets = [
  {
    id: "T-1001",
    title: "Não consigo acessar minha conta de e-mail",
    status: "open",
    priority: "high",
    category: "email",
    created: "2 horas atrás",
    updated: "30 minutos atrás",
    messages: 3,
    type: "incident",
  },
  {
    id: "T-1002",
    title: "Solicitação de novo notebook",
    status: "pending",
    priority: "medium",
    category: "hardware",
    created: "1 dia atrás",
    updated: "5 horas atrás",
    messages: 2,
    type: "request",
  },
  {
    id: "T-1003",
    title: "Problemas de conexão VPN",
    status: "in-progress",
    priority: "medium",
    category: "network",
    created: "3 dias atrás",
    updated: "1 dia atrás",
    messages: 5,
    type: "incident",
  },
  {
    id: "T-1004",
    title: "Solicitação de instalação de software",
    status: "resolved",
    priority: "low",
    category: "software",
    created: "1 semana atrás",
    updated: "2 dias atrás",
    messages: 4,
    type: "request",
  },
]

export default function TicketList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const router = useRouter()

  const filteredAndSortedTickets = mockTickets
    .filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filter === "all" || ticket.status === filter
      const matchesType = typeFilter === "all" || ticket.type === typeFilter
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

      return matchesSearch && matchesFilter && matchesType && matchesPriority
    })
    .sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "priority":
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        default:
          aValue = a.id
          bValue = b.id
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTickets = filteredAndSortedTickets.slice(startIndex, startIndex + itemsPerPage)

  // Reset página quando filtros mudam
  const handleFilterChange = (newFilter: string, filterType: string) => {
    setCurrentPage(1)
    switch (filterType) {
      case "status":
        setFilter(newFilter)
        break
      case "type":
        setTypeFilter(newFilter)
        break
      case "priority":
        setPriorityFilter(newFilter)
        break
    }
  }

  // Obter cor do badge de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500"
      case "pending":
        return "bg-supportbox"
      case "in-progress":
        return "bg-purple-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Obter cor do badge de prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-supportbox"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Traduzir status para português
  const translateStatus = (status: string) => {
    switch (status) {
      case "open":
        return "Aberto"
      case "pending":
        return "Pendente"
      case "in-progress":
        return "Em Andamento"
      case "resolved":
        return "Resolvido"
      default:
        return status
    }
  }

  // Traduzir prioridade para português
  const translatePriority = (priority: string) => {
    switch (priority) {
      case "critical":
        return "Crítica"
      case "high":
        return "Alta"
      case "medium":
        return "Média"
      case "low":
        return "Baixa"
      default:
        return priority
    }
  }

  const handleViewDetails = (ticketId: string) => {
    router.push(`/ticket/${ticketId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar por título ou ID..."
              className="w-full lg:w-[350px] pl-8 border-supportbox/20 focus:ring-supportbox/30"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Data</SelectItem>
                <SelectItem value="priority">Prioridade</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="title">Título</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs
            value={filter}
            className="w-full sm:w-auto"
            onValueChange={(value) => handleFilterChange(value, "status")}
          >
            <TabsList className="bg-muted/50 grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-supportbox data-[state=active]:text-white">
                Todos
              </TabsTrigger>
              <TabsTrigger value="open" className="data-[state=active]:bg-supportbox data-[state=active]:text-white">
                Abertos
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="data-[state=active]:bg-supportbox data-[state=active]:text-white"
              >
                Andamento
              </TabsTrigger>
              <TabsTrigger
                value="resolved"
                className="data-[state=active]:bg-supportbox data-[state=active]:text-white"
              >
                Resolvidos
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            value={typeFilter}
            className="w-full sm:w-auto"
            onValueChange={(value) => handleFilterChange(value, "type")}
          >
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-supportbox data-[state=active]:text-white">
                Todos Tipos
              </TabsTrigger>
              <TabsTrigger value="request" className="data-[state=active]:bg-supportbox data-[state=active]:text-white">
                Solicitações
              </TabsTrigger>
              <TabsTrigger
                value="incident"
                className="data-[state=active]:bg-supportbox data-[state=active]:text-white"
              >
                Incidentes
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={priorityFilter} onValueChange={(value) => handleFilterChange(value, "priority")}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedTickets.length)} de{" "}
          {filteredAndSortedTickets.length} chamados
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Itens por página:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {paginatedTickets.length === 0 ? (
        <Card className="border-supportbox/20">
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum chamado encontrado com os critérios selecionados.</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => {
                  setSearchQuery("")
                  setFilter("all")
                  setTypeFilter("all")
                  setPriorityFilter("all")
                  setCurrentPage(1)
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="overflow-hidden border-supportbox/20 hover:border-supportbox/40 transition-all hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2 items-start">
                      {ticket.type === "incident" ? (
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                      ) : (
                        <Package className="h-5 w-5 text-supportbox mt-1" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {ticket.type === "incident" ? "Incidente" : "Solicitação"} {ticket.id} • {ticket.category}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className={`${getPriorityColor(ticket.priority)} text-white`}>
                        {translatePriority(ticket.priority)}
                      </Badge>
                      <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                        {translateStatus(ticket.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Criado {ticket.created}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      <span>{ticket.messages} mensagens</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-supportbox/10 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-supportbox hover:text-supportbox-dark hover:bg-supportbox/10"
                    onClick={() => handleViewDetails(ticket.id)}
                  >
                    Ver Detalhes
                  </Button>
                  {ticket.status !== "resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-supportbox/20 text-supportbox hover:text-supportbox-dark hover:bg-supportbox/10 bg-transparent"
                      onClick={() => handleViewDetails(ticket.id)}
                    >
                      Adicionar Comentário
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-supportbox hover:bg-supportbox/90" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
