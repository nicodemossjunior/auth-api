# Proposta de Design: Sistema de Autenticação com JWT

Este documento detalha a arquitetura de uma solução de autenticação completa, utilizando um backend em Spring Boot, um frontend em React e um banco de dados PostgreSQL. A autenticação será baseada em JSON Web Tokens (JWT).

## 1. Visão Geral da Arquitetura

A solução será dividida em três componentes principais:

1.  **Frontend (React)**: Uma Single-Page Application (SPA) responsável pela interface do usuário. Ela gerenciará os formulários de login e registro, armazenará o JWT de forma segura e o enviará em cada requisição para rotas protegidas.
2.  **Backend (API Spring Boot)**: Uma API RESTful que expõe endpoints para registro, autenticação e acesso a recursos. Será responsável por validar credenciais, gerar e validar JWTs, e proteger endpoints.
3.  **Banco de Dados (PostgreSQL)**: Um banco de dados relacional para persistir as informações dos usuários, como nome, email, senha (hash) e perfis de acesso.

O fluxo de comunicação básico será:

```
[Frontend React] <--- (HTTP/S) ---> [Backend Spring Boot API] <--- (JDBC) ---> [Banco de Dados PostgreSQL]
```

---

## 2. Stack de Tecnologias

*   **Backend**:
    *   Java 17+
    *   Spring Boot 3.x
    *   Spring Security 6.x
    *   Spring Data JPA
    *   Hibernate
    *   JJWT (Java JWT library)
    *   PostgreSQL Driver
    *   Maven ou Gradle (Gerenciador de dependências)
*   **Frontend**:
    *   React 18+
    *   React Router DOM (para roteamento)
    *   Axios (para requisições HTTP)
    *   Vite ou Create React App (para setup do projeto)
*   **Banco de Dados**:
    *   PostgreSQL 14+

---

## 3. Design do Banco de Dados (PostgreSQL)

Sugerimos uma estrutura simples com duas tabelas principais para gerenciar usuários e seus papéis (perfis), o que nos dá flexibilidade para controle de acesso (RBAC - Role-Based Access Control).

#### Tabela: `users`

Armazena as informações principais do usuário.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identificador único do usuário. |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | Primeiro nome do usuário. |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | Sobrenome do usuário. |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Email do usuário, usado para login. |
| `password` | `VARCHAR(255)` | `NOT NULL` | Senha do usuário, armazenada como hash (e.g., bcrypt). |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Data e hora de criação do registro. |

#### Tabela: `roles`

Armazena os diferentes papéis ou perfis que um usuário pode ter.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY` | Identificador único do papel (e.g., 1=ADMIN, 2=USER). |
| `name` | `VARCHAR(50)` | `NOT NULL, UNIQUE`| Nome do papel (e.g., 'ROLE_ADMIN', 'ROLE_USER'). |

#### Tabela de Junção: `user_roles`

Associa usuários a seus respectivos papéis (relação Muitos-para-Muitos).

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `user_id` | `BIGINT` | `FOREIGN KEY (users.id)` | Chave estrangeira para a tabela `users`. |
| `role_id` | `INTEGER` | `FOREIGN KEY (roles.id)` | Chave estrangeira para a tabela `roles`. |

---

## 4. Design do Backend (API Spring Boot)

A API será estruturada em pacotes para separar responsabilidades, seguindo as melhores práticas do Spring.

#### Estrutura de Pacotes Sugerida:

```
com.authapi
├── config/
│   ├── SecurityConfig.java      // Configuração do Spring Security (filtros, rotas públicas/privadas)
│   └── WebConfig.java           // Configuração de CORS
├── controller/
│   ├── AuthController.java      // Endpoints de login e registro
│   └── DataController.java      // Endpoints de exemplo para rotas protegidas
├── dto/
│   ├── AuthDto.java             // DTO para request de login (email, senha)
│   ├── UserDto.java             // DTO para request de registro
│   └── TokenDto.java            // DTO para response com o JWT
├── model/
│   ├── User.java                // Entidade JPA para a tabela 'users'
│   └── Role.java                // Entidade JPA para a tabela 'roles'
├── repository/
│   ├── UserRepository.java      // Spring Data JPA Repository para User
│   └── RoleRepository.java      // Spring Data JPA Repository para Role
├── security/
│   ├── TokenProvider.java       // Classe para gerar, validar e extrair informações do JWT
│   └── JwtAuthFilter.java       // Filtro que intercepta requisições e valida o JWT
└── service/
    ├── AuthService.java         // Lógica de negócio para autenticação e registro
    └── CustomUserDetailsService.java // Implementação do UserDetailsService do Spring Security
```

#### Endpoints da API:

| Método | Rota | Descrição | Autenticação |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registra um novo usuário. | Pública |
| `POST` | `/api/auth/login` | Autentica um usuário e retorna um JWT. | Pública |
| `GET` | `/api/data/user` | Exemplo de rota que retorna dados para qualquer usuário autenticado. | Requer `ROLE_USER` ou `ROLE_ADMIN` |
| `GET` | `/api/data/admin` | Exemplo de rota que retorna dados apenas para administradores. | Requer `ROLE_ADMIN` |

#### Fluxo de Autenticação (JWT):

1.  **Login**: O usuário envia `email` e `senha` para `POST /api/auth/login`.
2.  **Validação**: O `AuthService` usa o `AuthenticationManager` do Spring Security para validar as credenciais. A senha enviada é comparada com o hash armazenado no banco de dados.
3.  **Geração do JWT**: Se as credenciais forem válidas, o `TokenProvider` gera um JWT.
    *   **Payload do JWT**: Conterá informações como `sub` (subject, email do usuário), `roles` (perfis de acesso), `iat` (issued at) e `exp` (expiration time).
    *   **Assinatura**: O token será assinado com um segredo (secret key) configurado no `application.properties` para garantir sua integridade.
4.  **Resposta**: A API retorna o JWT para o cliente.
5.  **Requisições Subsequentes**: O cliente (React) anexa o JWT no cabeçalho `Authorization` de cada requisição para rotas protegidas (e.g., `Authorization: Bearer <jwt>`).
6.  **Filtro de Segurança**: O `JwtAuthFilter` intercepta a requisição, extrai o token do cabeçalho, valida sua assinatura e expiração usando o `TokenProvider`.
7.  **Autorização**: Se o token for válido, o filtro extrai as informações do usuário e configura o `SecurityContextHolder` do Spring, permitindo que a requisição prossiga para o controller protegido. Se o token for inválido, a API retorna um erro `401 Unauthorized`.

---

## 5. Design do Frontend (React)

O frontend será organizado para ser escalável e de fácil manutenção.

#### Estrutura de Pastas Sugerida:

```
src/
├── components/         // Componentes reutilizáveis (Button, Input, etc.)
├── pages/              // Componentes de página (Login, Register, Dashboard)
├── services/           // Lógica de comunicação com a API (authService.js)
├── context/            // Contexto React para gerenciamento de estado de autenticação
├── hooks/              // Hooks customizados (e.g., useAuth)
├── utils/              // Funções utilitárias
└── App.js              // Componente principal com as rotas
```

#### Fluxo de Navegação e Estado:

1.  **Roteamento**: `react-router-dom` será usado para gerenciar as rotas.
    *   **Rotas Públicas**: `/login`, `/register`. Acessíveis a todos.
    *   **Rotas Privadas**: `/dashboard`, `/profile`. Acessíveis apenas para usuários autenticados. Um componente `PrivateRoute` verificará se o usuário está logado; caso contrário, redirecionará para `/login`.
2.  **Gerenciamento de Estado de Autenticação**:
    *   Um `AuthContext` será criado para prover o estado de autenticação (usuário, token, status de login) para toda a aplicação.
    *   O `AuthContext` também exporá funções como `login(email, password)`, `register(...)` e `logout()`.
3.  **Armazenamento do JWT**: Após o login bem-sucedido, o JWT retornado pela API será armazenado no `localStorage` ou `sessionStorage` do navegador.
    *   `localStorage`: Persiste o login entre sessões do navegador.
    *   `sessionStorage`: O login é perdido quando a aba é fechada.
4.  **Comunicação com a API**:
    *   `axios` será usado para todas as chamadas HTTP.
    *   Uma instância do `axios` será configurada com um *interceptor*. Esse interceptor anexará automaticamente o cabeçalho `Authorization: Bearer <jwt>` a todas as requisições, lendo o token do `localStorage`.
    *   O interceptor também pode tratar erros de `401 Unauthorized` (e.g., token expirado), realizando o logout automático do usuário e redirecionando-o para a página de login.

#### Componentes Principais:

*   **`LoginPage.js`**: Formulário com campos de email e senha. Ao submeter, chama a função `login` do `AuthContext`.
*   **`RegisterPage.js`**: Formulário com campos para nome, email e senha. Ao submeter, chama a função `register`.
*   **`DashboardPage.js`**: Exemplo de página protegida que busca e exibe dados da API (`/api/data/user`).
*   **`App.js`**: Define as rotas da aplicação usando `<Routes>` e `<Route>`, envolvendo as rotas privadas com o componente `PrivateRoute`.
*   **`AuthProvider.js`**: Componente que implementa o `AuthContext`, contendo toda a lógica de estado de autenticação.

---

## 6. Próximos Passos

Com este design aprovado, a implementação pode começar na seguinte ordem:

1.  **Setup do Ambiente**: Instalar PostgreSQL, configurar o Java/Maven e o Node.js/npm.
2.  **Backend**:
    *   Criar o projeto Spring Boot.
    *   Configurar a conexão com o banco de dados.
    *   Implementar as entidades JPA (`User`, `Role`).
    *   Implementar os repositórios, DTOs e o `TokenProvider`.
    *   Configurar o `Spring Security` com o filtro JWT.
    *   Criar os controllers e serviços para `register` e `login`.
    *   Criar os endpoints protegidos de exemplo.
3.  **Frontend**:
    *   Criar o projeto React.
    *   Estruturar as pastas.
    *   Implementar o `AuthContext` e o `AuthProvider`.
    *   Configurar o `axios` com o interceptor.
    *   Criar as páginas de `Login`, `Registro` e `Dashboard`.
    *   Configurar o roteamento com `react-router-dom`, incluindo as rotas privadas.
4.  **Testes e Refinamento**: Testar o fluxo completo, refinar a UI/UX e garantir que o tratamento de erros está robusto.
