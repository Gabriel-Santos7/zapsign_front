# ZapSign Frontend

## 📋 Resumo Executivo

Aplicação frontend desenvolvida em Angular 21 para gerenciamento de documentos e assinaturas digitais, integrada com a API ZapSign. A interface oferece uma experiência fluida e moderna, permitindo que empresas clientes gerenciem documentos, visualizem métricas, recebam alertas e obtenham insights automáticos sobre seus contratos através de análise com IA.

### Principais Funcionalidades

- ✅ **Interface Fluida**: Navegação sem reload de página (SPA)
- ✅ **CRUD Completo**: Gerenciamento completo de documentos e signatários
- ✅ **Dashboard Interativo**: Métricas, alertas e gráficos em tempo real
- ✅ **Análise com IA**: Visualização de insights e análise inteligente de documentos
- ✅ **Autenticação Segura**: Sistema de login com tokens e proteção de rotas
- ✅ **Design Moderno**: Interface responsiva com PrimeNG
- ✅ **Testes Automatizados**: Cobertura de testes com Vitest

## 🚀 Links de Produção

- **Aplicação em Produção**: https://zapsign-front1.onrender.com
- **API Backend**: https://zapsign-api.onrender.com
- **Documentação da API**: https://zapsign-api.onrender.com/api/schema/swagger-ui/

## 🛠️ Tecnologias Utilizadas

### Framework e Core
- **Angular 21.0**: Framework principal
- **TypeScript 5.9**: Linguagem de programação
- **RxJS 7.8**: Programação reativa
- **Angular Signals**: Gerenciamento de estado reativo

### UI e Estilização
- **PrimeNG 21.0.2**: Biblioteca de componentes UI
- **PrimeIcons 7.0**: Ícones
- **Chart.js 4.5.1**: Gráficos e visualizações
- **SCSS**: Pré-processador CSS

### Testes
- **Vitest 4.0**: Test runner moderno
- **@vitest/ui**: Interface para testes
- **@vitest/coverage-v8**: Cobertura de código
- **jsdom**: Ambiente de testes DOM

### Build e Deploy
- **Angular CLI 21.0**: Ferramentas de build
- **@angular/build**: Novo builder do Angular
- **Render**: Plataforma de deploy

## 📦 Configuração Local

### Pré-requisitos

- Node.js 20.x ou superior
- npm 11.6.2 ou superior

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd zapsign_front
```

### 2. Instale as Dependências

```bash
npm install
```
### 3. Configure Variáveis de Ambiente

O projeto usa arquivos de ambiente. Para desenvolvimento local, o arquivo `src/environments/environment.ts` já está configurado:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  defaultCompanyId: 1
};
```

Para produção, o arquivo `src/environments/environment.production.ts` está configurado para usar a API em produção.

### 4. Execute o Servidor de Desenvolvimento

```bash
npm start
# ou
npm run dev
```

A aplicação estará disponível em: `http://localhost:4200`

### 5. Build para Produção

```bash
npm run build
```

Os arquivos compilados estarão em `dist/zapsign_front/browser/`

## 🔄 Fluxo da Aplicação

### Fluxo de Navegação

```mermaid
flowchart TD
    Start([Usuário Acessa Aplicação]) --> CheckAuth{Autenticado?}
    CheckAuth -->|"Não"| Login[Login]
    CheckAuth -->|"Sim"| Dashboard[Dashboard]
    Login --> LoginForm[Formulário de Login]
    LoginForm --> AuthAPI["API: POST /api-token-auth/"]
    AuthAPI -->|"Sucesso"| StoreToken[Armazena Token]
    StoreToken --> Redirect[Dashboard]
    Dashboard --> Documents[Documents]
    Dashboard --> Metrics[Métricas e Alertas]
    Documents --> List[Lista de Documentos]
    Documents --> Create[Criar Documento]
    Documents --> Detail[Detalhes do Documento]
    Detail --> Edit[Editar Documento]
    Detail --> Insights[Insights do Documento]
    Create --> API["API: POST /documents/"]
    API -->|"Sucesso"| List
```

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Router as Angular Router
    participant Guard as AuthGuard
    participant AuthService as AuthService
    participant API as Backend API
    participant Interceptor as AuthInterceptor

    User->>Router: Acessa rota protegida
    Router->>Guard: Verifica autenticação
    Guard->>AuthService: isAuthenticated()
    AuthService-->>Guard: false (não autenticado)
    Guard->>Router: Redireciona para /login
    Router->>User: Exibe página de login
    User->>API: Submete credenciais
    API-->>User: Retorna token
    User->>AuthService: login(token)
    AuthService->>AuthService: Armazena token (sessionStorage)
    AuthService->>Router: Redireciona para rota original
    User->>API: Requisição HTTP
    Interceptor->>Interceptor: Adiciona token no header
    Interceptor->>API: Requisição com Authorization
    API-->>Interceptor: Resposta
    Interceptor-->>User: Dados retornados
```

### Fluxo de Criação de Documento

```mermaid
flowchart TD
    Start([Usuário acessa /documents/create]) --> Form[Formulário de Criação]
    Form --> Validate{Validação}
    Validate -->|Inválido| Error[Exibe erros]
    Validate -->|Válido| Submit[Submete formulário]
    Submit --> ValidatePDF[Valida URL PDF]
    ValidatePDF -->|Inválida| Error
    ValidatePDF -->|Válida| Loading[Exibe loading]
    Loading --> API[DocumentService.createDocument]
    API --> Backend[API: POST /companies/:id/documents/]
    Backend -->|Sucesso| Success[Documento criado]
    Backend -->|Erro| ErrorAPI[Erro da API]
    Success --> Notification[Toast: Sucesso]
    Success --> Redirect[Redireciona para /documents/:id]
    ErrorAPI --> ErrorToast[Toast: Erro]
    Error --> Form
    ErrorToast --> Form
```

### Fluxo de Análise de Documento

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Component as DocumentInsightsComponent
    participant Service as DocumentService
    participant API as Backend API

    User->>Component: Acessa /documents/:id/insights
    Component->>Service: getDocument(id)
    Service->>API: GET /documents/:id
    API-->>Service: Documento
    Service-->>Component: Documento
    Component->>Component: Verifica se tem análise
    alt Documento não analisado
        Component->>User: Exibe botão "Analisar"
        User->>Component: Clica em "Analisar"
        Component->>Service: analyzeDocument(id)
        Service->>API: POST /documents/:id/analyze
        API-->>Service: Análise em processamento
        Component->>Component: Exibe loading
        API->>API: Processa análise com IA
        API-->>Service: Análise completa
        Service-->>Component: Dados da análise
    else Documento já analisado
        Component->>Service: getInsights(id)
        Service->>API: GET /documents/:id/insights
        API-->>Service: Insights
        Service-->>Component: Insights
    end
    Component->>User: Exibe insights, resumo e tópicos
```

### Fluxo de Interceptação HTTP

```mermaid
flowchart TD
    Start([Requisição HTTP]) --> AuthInterceptor[AuthInterceptor]
    AuthInterceptor --> CheckToken{Token existe?}
    CheckToken -->|Sim| AddHeader[Adiciona Authorization header]
    CheckToken -->|Não| Continue[Continua sem token]
    AddHeader --> Continue
    Continue --> Backend[Backend API]
    Backend -->|Sucesso| ErrorInterceptor[ErrorInterceptor]
    Backend -->|Erro| ErrorInterceptor
    ErrorInterceptor --> CheckError{Tipo de erro}
    CheckError -->|401 Unauthorized| Logout[Logout automático]
    CheckError -->|Outros erros| Toast[Exibe toast de erro]
    Logout --> RedirectLogin[Redireciona para /login]
    Toast --> Return[Retorna erro ao componente]
    ErrorInterceptor -->|200 OK| ReturnSuccess[Retorna dados]
    ReturnSuccess --> Component[Componente]
    Return --> Component
    RedirectLogin --> Component
```

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── core/                    # Funcionalidades core (singleton)
│   │   ├── guards/             # Guards de rota (AuthGuard)
│   │   ├── interceptors/       # Interceptors HTTP
│   │   └── services/           # Serviços core (Auth, Company, Document, Notification)
│   │
│   ├── features/               # Módulos de funcionalidades
│   │   ├── auth/               # Autenticação
│   │   │   └── components/
│   │   │       └── login/      # Componente de login
│   │   │
│   │   ├── dashboard/          # Dashboard principal
│   │   │   ├── components/
│   │   │   │   ├── alerts-list/        # Lista de alertas
│   │   │   │   ├── metrics-cards/      # Cards de métricas
│   │   │   │   └── metrics-charts/     # Gráficos de métricas
│   │   │   └── dashboard.routes.ts
│   │   │
│   │   └── documents/          # Gerenciamento de documentos
│   │       ├── components/
│   │       │   ├── document-create/    # Criar documento
│   │       │   ├── document-detail/    # Detalhes do documento
│   │       │   ├── document-edit/      # Editar documento
│   │       │   ├── document-insights/   # Insights e análise
│   │       │   └── document-list/       # Lista de documentos
│   │       └── documents.routes.ts
│   │
│   ├── layout/                 # Componentes de layout
│   │   └── components/
│   │       ├── header/         # Cabeçalho
│   │       ├── main-layout/    # Layout principal
│   │       ├── notification-toast/  # Notificações
│   │       └── sidebar/       # Barra lateral
│   │
│   ├── shared/                 # Componentes e utilitários compartilhados
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── loading/        # Loading spinner
│   │   │   ├── pdf-url-validator/  # Validador de URL PDF
│   │   │   └── status-badge/   # Badge de status
│   │   ├── models/             # Modelos TypeScript
│   │   ├── pipes/              # Pipes customizados
│   │   └── utils/              # Utilitários
│   │
│   ├── app.routes.ts           # Rotas principais
│   └── app.config.ts           # Configuração da aplicação
│
├── environments/               # Configurações de ambiente
│   ├── environment.ts          # Desenvolvimento
│   └── environment.production.ts  # Produção
│
├── tests/                      # Fixtures e mocks para testes
│   ├── fixtures/
│   └── mocks/
│
└── styles.scss                 # Estilos globais
```

### Arquitetura

O projeto segue uma **arquitetura baseada em features**, organizando o código por funcionalidades:

- **Core**: Funcionalidades singleton (serviços, guards, interceptors)
- **Features**: Módulos independentes por funcionalidade (auth, dashboard, documents)
- **Shared**: Componentes, modelos e utilitários compartilhados
- **Layout**: Componentes de estrutura da aplicação

## 🎯 Funcionalidades Principais

### Autenticação

- **Login**: Autenticação via token
- **AuthGuard**: Proteção de rotas autenticadas
- **AuthInterceptor**: Adição automática de token nas requisições
- **ErrorInterceptor**: Tratamento centralizado de erros HTTP

### Dashboard

- **Métricas**: Cards com estatísticas de documentos
- **Gráficos**: Visualizações com Chart.js
- **Alertas**: Lista de alertas importantes
- **Atualização em tempo real**: Dados atualizados via API

### Gerenciamento de Documentos

- **Listagem**: Tabela paginada com filtros
- **Criação**: Formulário completo com validação
- **Edição**: Edição inline de documentos
- **Detalhes**: Visualização completa com signatários
- **Exclusão**: Confirmação antes de excluir

### Análise de Documentos

- **Insights**: Visualização de análise com IA
- **Resumo**: Resumo automático do documento
- **Tópicos Faltantes**: Lista de tópicos que podem estar faltando
- **Análise sob demanda**: Botão para solicitar nova análise

### Layout Responsivo

- **Sidebar**: Navegação principal
- **Header**: Cabeçalho com informações do usuário
- **Notificações Toast**: Feedback visual de ações
- **Design Responsivo**: Adaptável a diferentes tamanhos de tela

## 🧪 Executando Testes

### Executar Todos os Testes

```bash
npm test
```

### Executar em Modo Watch

```bash
npm run test:watch
```

### Executar com Interface UI

```bash
npm run test:ui
```

### Executar com Cobertura

```bash
npm run test:coverage
```

### Executar em CI

```bash
npm run test:ci
```

## 🚀 Build e Deploy

### Build para Produção

```bash
npm run build
```

O build otimizado será gerado em `dist/zapsign_front/browser/`

### Deploy no Render

O projeto está configurado para deploy automático no Render via `render.yaml`:

```yaml
static_sites:
  - name: zapsign-front
    buildCommand: npm ci --legacy-peer-deps && NODE_OPTIONS='--max-old-space-size=512' npm run build
    publishPath: ./dist/zapsign_front/browser
```

### Variáveis de Ambiente no Render

- **NODE_VERSION**: `20.x`
- **NODE_OPTIONS**: `--max-old-space-size=512`
- **API_URL**: `https://zapsign-api.onrender.com/api`

### Otimizações Aplicadas

- **Source maps desabilitados** em produção
- **Tree shaking** automático
- **Code splitting** por rotas (lazy loading)
- **Minificação** de CSS e JavaScript
- **Otimização de imagens**


## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm start          # Inicia servidor de desenvolvimento
npm run dev        # Inicia servidor e abre no navegador

# Build
npm run build      # Build para produção
npm run build:render  # Build otimizado para Render

# Testes
npm test           # Executa testes uma vez
npm run test:watch # Executa testes em modo watch
npm run test:ui    # Abre interface UI do Vitest
npm run test:coverage  # Executa testes com cobertura
npm run test:ci    # Executa testes para CI

# Outros
npm run watch      # Build em modo watch
```

---
