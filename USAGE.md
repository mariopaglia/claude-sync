# Como usar o claude-sync

## Instalação

### Após publicação no npm:
```bash
npm install -g claude-sync
```

### Para testar localmente (já feito):
```bash
cd /caminho/para/claude-code-sync-config
npm link
```

---

## Fluxo de uso completo

### 1️⃣ Primeira máquina — Configuração inicial

```bash
# Inicializar e criar gist
claude-sync init
```

Isso vai:
- Autenticar com GitHub (via `gh auth token`, `GITHUB_TOKEN`, ou prompt)
- Escanear `~/.claude/` em busca de arquivos sincronizáveis
- Criar um **secret gist** com sua configuração
- Salvar o link em `~/.claude-sync/config.json`

### 2️⃣ Fazer mudanças e sincronizar

```bash
# Ver o que mudou localmente vs remote
claude-sync status

# Enviar mudanças para o gist
claude-sync push

# Ou forçar sem confirmação
claude-sync push --force
```

### 3️⃣ Segunda máquina — Baixar configuração

**Opção A: Linkar a um gist existente**
```bash
# Use o gist ID do passo 1
claude-sync link abc123def456

# Baixar configuração
claude-sync pull
```

**Opção B: Se você já tem `~/.claude-sync/config.json` sincronizado**
```bash
# Apenas faça pull
claude-sync pull
```

### 4️⃣ Resolver conflitos durante pull

Quando há arquivos modificados em ambos os lados:

```bash
claude-sync pull
```

Você verá um diff colorido e poderá escolher:
- **Keep remote** — aceita a versão do gist (faz backup da local)
- **Keep local** — mantém a versão local
- **Skip** — não faz nada

---

## Comandos adicionais

### Compartilhar sua configuração publicamente

```bash
claude-sync share
```

Isso cria um **gist público** (separado do seu sync privado) que você pode compartilhar:
- Você escolhe quais arquivos incluir
- Recebe um link para compartilhar

### Importar configuração de outra pessoa

```bash
# De uma URL
claude-sync import https://gist.github.com/usuario/abc123

# Ou apenas o ID
claude-sync import abc123def456
```

Você pode selecionar quais itens importar (agents, skills, settings, etc.).

### Deslinkar do gist

```bash
claude-sync unlink
```

Remove a conexão local, mas **NÃO apaga o gist**. Útil se você quiser resetar ou conectar a outro gist.

---

## Autenticação

O `claude-sync` procura um token GitHub nesta ordem:

1. **GitHub CLI**: `gh auth token` (se você tem o `gh` instalado)
2. **Variável de ambiente**: `GITHUB_TOKEN`
3. **Config salvo**: `~/.claude-sync/config.json`
4. **Prompt interativo**: pede o token e salva para uso futuro

### Criar um token manualmente

Se precisar criar um token:

1. Acesse: https://github.com/settings/tokens/new?scopes=gist
2. Dê um nome (ex: "claude-sync")
3. Marque apenas o scope **gist**
4. Gere e copie o token
5. Use no prompt ou defina como `GITHUB_TOKEN`

---

## O que é sincronizado

✅ **Sincronizado:**
- `settings.json`
- `keybindings.json`
- `CLAUDE.md`
- `agents/` (AGENT.md + arquivos de suporte)
- `skills/` (SKILL.md + arquivos de suporte)
- `rules/*.md`

❌ **NUNCA sincronizado (por segurança):**
- `~/.claude.json` (contém tokens OAuth)
- `*.local.json`, `*.local.md` (overrides locais)
- `agent-memory/` (dados de sessão)
- `ide/`, `statsig/`, `todo/`, `tmp/`
- `*.bak` (backups automáticos)

---

## Exemplos de uso

### Sincronizar entre trabalho e casa

```bash
# No trabalho
claude-sync init
claude-sync push

# Em casa
claude-sync link <gist-id-do-trabalho>
claude-sync pull
```

### Compartilhar seu agent customizado

```bash
# Criar gist público apenas com agents
claude-sync share
# (desmarque tudo exceto agents/)

# Outras pessoas importam
claude-sync import https://gist.github.com/seu-usuario/xyz
```

### Backup antes de experimentos

```bash
# Suas configurações já estão no gist após push
claude-sync push

# Faça experimentos localmente...
# Se der errado:
claude-sync pull --force  # volta para versão do gist
```

---

## Backups automáticos

Antes de sobrescrever qualquer arquivo local durante `pull` ou `import`, o claude-sync cria backups em:

```
~/.claude-sync/backups/
```

Formato: `2026-02-09T19-30-00-000Z_<caminho-do-arquivo>`

Mantém os últimos 5 backups por arquivo automaticamente.

---

## Troubleshooting

### "Not initialized"
```bash
claude-sync init  # ou
claude-sync link <gist-id>
```

### "Invalid or expired GitHub token"
```bash
# Se usando gh CLI:
gh auth login

# Se usando token manual:
# Crie um novo token e execute qualquer comando
# Será solicitado o novo token
```

### "Gist not found"
O gist pode ter sido deletado. Crie um novo:
```bash
claude-sync unlink
claude-sync init
```

### Ver diff sem fazer mudanças
```bash
claude-sync status
```
