
# 📦 SeiTools- Sistema de Gestão de Inventário e Ferramentaria

O **SeiTools** é uma solução empresarial completa para o controlo de stock, gestão de empréstimos de ferramentas e auditoria de processos. O sistema oferece uma visão analítica detalhada para gestores e processos operacionais simplificados para os utilizadores.

## 🛠️ Funcionalidades Detalhadas

### 1. Painel de Controlo Analítico (Dashboard)
O dashboard é o núcleo de inteligência do sistema, oferecendo monitorização em tempo real:
* **KPIs de Resumo**: Cartões com métricas sobre o estado do inventário e empréstimos ativos.
* **Gráficos Diversificados**:
    * **Fluxo Diário**: Monitorização de entradas e saídas ao longo do tempo.
    * **Ranking de Funcionários**: Identificação dos colaboradores com maior volume de requisições.
    * **Mapa de Calor**: Visualização de períodos de maior pico de atividade.
    * **Envelhecimento de Stock**: Análise de itens parados há mais tempo.
    * **Top Itens & Categorias**: Distribuição do inventário por frequência de uso e categoria.
* **Filtros Temporais**: Alternância entre dados dos últimos 30 dias, 6 meses, 12 meses ou histórico completo.
* **Exportação**: Geração de relatórios em Excel (`.xlsx`) e suporte para impressão física do painel.

### 2. Módulo de Ferramentaria (Empréstimos)
Focado no ciclo de vida da movimentação de ferramentas e materiais:
* **Gestão de Saídas**: Registo de novos empréstimos através de formulários dedicados.
* **Controlo de Devoluções**: Interface para processar o retorno de materiais.
* **Recibos de Impressão**: Geração de comprovativos de movimentação.
* **Filtros de Busca**: Localização de empréstimos por estado, data ou colaborador.

### 3. Gestão de Inventário (Materiais)
Controlo total sobre o catálogo de materiais:
* **Gestão Completa (CRUD)**: Adição, edição e remoção de materiais com suporte a modais.
* **Stock Crítico**: Painel de alertas para itens com baixo nível de segurança.
* **Categorização**: Organização de itens por grupos para facilitar a auditoria.

### 4. Administração e Segurança
Camada robusta de proteção e gestão de dados:
* **Controlo de Acesso (RBAC)**: Diferenciação entre perfis de utilizador e Administradores.
* **Trava de Segurança**: Redirecionamento automático de utilizadores não autorizados em páginas administrativas.
* **Log de Auditoria**: Registo cronológico (quem, o quê, quando) de todas as ações críticas.
* **Gestão de Utilizadores**: Interface administrativa para criação e manutenção de contas.
* **Segurança de Conta**: Funcionalidade integrada para alteração de senha.

## 🏗️ Stack Tecnológica

* **Frontend**: React 18.3 com Vite e TypeScript.
* **Estilização**: Tailwind CSS 4.1 para design responsivo e moderno.
* **Backend & Auth**: Integração com Supabase (Database e Autenticação).
* **Componentes UI**: Radix UI para acessibilidade (Accordion, Dialog, Tabs, Popover).
* **Gráficos**: Recharts para visualizações interativas.
* **Utilitários**:
    * `react-hook-form` & `zod`: Validação de formulários.
    * `xlsx` & `file-saver`: Exportação de dados.
    * `lucide-react`: Biblioteca de ícones.
    * `sonner`: Sistema de notificações (toasts).

## 📂 Organização do Código

* **`/src/app/features`**: Lógica de negócio dividida por módulos (dashboard, emprestimos, estoque, usuarios).
* **`/src/app/contexts`**: Estados globais (Auth, Auditoria, Configurações, Empréstimos, Materiais).
* **`/src/app/services`**: Comunicação com o Supabase SDK.
* **`/src/app/components/ui`**: Biblioteca de componentes de interface.

## 🚀 Como Iniciar

1. Instale as dependências: `npm install`.
2. Inicie o servidor de desenvolvimento: `npm run dev`.
3. Para produção: `npm run build`.

