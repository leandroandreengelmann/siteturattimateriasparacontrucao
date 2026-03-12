# Especificação de Banco de Dados — Funcionalidade: Vendedores WhatsApp por Loja

## Contexto do Projeto

Este projeto usa **Supabase** (PostgreSQL) como banco de dados. Já existe uma tabela `stores` que representa as filiais da empresa. Preciso que você analise o banco atual e crie tudo o que for necessário para suportar uma nova funcionalidade: **cada loja pode ter múltiplos vendedores com número de WhatsApp**, que serão exibidos publicamente para o cliente escolher com quem falar.

---

## O que você deve fazer

### 1. Inspecionar o banco atual

Antes de criar qualquer coisa, execute estas queries e analise os resultados:

```sql
-- Ver todas as tabelas existentes
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver estrutura da tabela stores
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'stores'
ORDER BY ordinal_position;

-- Ver políticas RLS existentes
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

---

### 2. Criar a tabela `store_sellers`

Com base no que você encontrar, crie a tabela seguindo este modelo:

**Campos necessários:**

| Campo | Tipo | Observações |
|---|---|---|
| `id` | uuid | PK, gerado automaticamente |
| `store_id` | uuid | FK para `stores.id`, obrigatório |
| `name` | text | Nome do vendedor, obrigatório |
| `whatsapp` | text | Número completo com DDI+DDD, ex: `5511999999999`, obrigatório |
| `is_active` | boolean | Padrão `true` |
| `display_order` | integer | Para ordenação manual, padrão `0` |
| `created_at` | timestamptz | Padrão `now()` |

**Regras:**
- `store_id` deve ter `ON DELETE CASCADE` (ao deletar uma loja, deleta todos os vendedores dela)
- Habilitar RLS na tabela
- Leitura pública (anônimo pode ler)
- Escrita apenas para usuários autenticados (insert, update, delete)

---

### 3. Políticas RLS

Seguindo o mesmo padrão das políticas já existentes no banco (verifique com a query acima), criar:

- `SELECT`: público (todos podem ler)
- `INSERT`: apenas `auth.role() = 'authenticated'`
- `UPDATE`: apenas `auth.role() = 'authenticated'`
- `DELETE`: apenas `auth.role() = 'authenticated'`

---

### 4. O que NÃO fazer

- Não alterar a tabela `stores` existente
- Não criar storage bucket (não há upload de imagem para vendedores)
- Não criar funções ou triggers complexos — apenas a tabela, FK e RLS são suficientes

---

### 5. Retorno esperado

Após executar tudo, me retorne:

1. O SQL completo que foi executado
2. Confirmação de que a tabela foi criada com sucesso
3. Confirmação de que as políticas RLS estão ativas
4. A estrutura final da tabela (output de `\d store_sellers` ou query equivalente)

---

## Contexto adicional

- Banco: Supabase (PostgreSQL 15+)
- As queries devem ser seguras para reexecutar (`IF NOT EXISTS` onde aplicável)
- O projeto já usa `extensions.moddatetime` para trigger de `updated_at` em outras tabelas — não é necessário aqui pois não há campo `updated_at` em `store_sellers`
