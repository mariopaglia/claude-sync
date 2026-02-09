# Guia de Publicação - claude-sync

## Pré-requisitos

- [ ] Conta no GitHub
- [ ] Conta no npm (criar em https://www.npmjs.com/signup)
- [ ] Git instalado
- [ ] npm configurado

---

## Passo 1: Criar repositório no GitHub

### Via interface web:

1. Acesse https://github.com/new
2. Nome do repositório: `claude-sync`
3. Descrição: `Sync your Claude Code configuration across machines using GitHub Gists`
4. **Deixe PRIVADO inicialmente** (ou público se preferir)
5. **NÃO** marque "Add a README" (já temos)
6. **NÃO** adicione .gitignore (já temos)
7. **NÃO** adicione licença (já temos)
8. Clique em "Create repository"

### Via GitHub CLI (alternativa):

```bash
gh repo create claude-sync --public --description "Sync your Claude Code configuration across machines using GitHub Gists" --source=. --push
```

---

## Passo 2: Configurar Git local e fazer push

```bash
cd /home/mariopaglia/projects/claude-code-sync-config

# Inicializar git (se ainda não estiver)
git init

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/claude-sync.git
# OU via SSH:
# git remote add origin git@github.com:SEU-USUARIO/claude-sync.git

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: claude-sync v1.0.1

- CLI tool to sync Claude Code configuration using GitHub Gists
- Commands: init, push, pull, status, share, import, link, unlink
- Support for settings, keybindings, CLAUDE.md, agents, skills, rules
- Automatic backups and conflict resolution
- Fix: Token persistence after init/link commands"

# Criar branch main se necessário
git branch -M main

# Push para GitHub
git push -u origin main
```

---

## Passo 3: Atualizar package.json com informações do repositório

Depois de criar o repositório, atualize o `package.json`:

```json
{
  "name": "claude-sync",
  "version": "1.0.1",
  "description": "Sync your Claude Code configuration across machines using GitHub Gists",
  "author": "Seu Nome <seu.email@exemplo.com>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/SEU-USUARIO/claude-sync.git"
  },
  "bugs": {
    "url": "https://github.com/SEU-USUARIO/claude-sync/issues"
  },
  "homepage": "https://github.com/SEU-USUARIO/claude-sync#readme"
}
```

Depois commit:
```bash
git add package.json
git commit -m "chore: add repository info to package.json"
git push
```

---

## Passo 4: Criar conta no npm (se não tiver)

1. Acesse https://www.npmjs.com/signup
2. Preencha: username, email, senha
3. Verifique seu email
4. Configure 2FA (recomendado): https://www.npmjs.com/settings/~/profile/2fa

---

## Passo 5: Fazer login no npm (localmente)

```bash
npm login
```

Você será solicitado:
- Username
- Password
- Email
- OTP (se tiver 2FA habilitado)

Para verificar se está logado:
```bash
npm whoami
```

---

## Passo 6: Verificar o pacote antes de publicar

### Verificar quais arquivos serão incluídos:

```bash
npm pack --dry-run
```

Deve mostrar apenas os arquivos necessários (dist/, package.json, README.md, LICENSE).

### Testar instalação local:

```bash
# Em outro diretório temporário
mkdir /tmp/test-claude-sync
cd /tmp/test-claude-sync
npm install /home/mariopaglia/projects/claude-code-sync-config

# Testar
npx claude-sync --version
```

---

## Passo 7: Publicar no npm

### Primeira publicação:

```bash
cd /home/mariopaglia/projects/claude-code-sync-config

# Build de produção
npm run build

# Rodar testes
npm test

# Publicar (primeira vez)
npm publish --access public
```

**Nota:** O `--access public` é necessário porque pacotes com escopo (como `@usuario/pacote`) são privados por padrão.

### Publicações futuras:

```bash
# 1. Atualizar versão
npm version patch  # 1.0.1 -> 1.0.2
# ou
npm version minor  # 1.0.1 -> 1.1.0
# ou
npm version major  # 1.0.1 -> 2.0.0

# 2. Build e test
npm run build
npm test

# 3. Commit e tag
git push
git push --tags

# 4. Publicar
npm publish
```

---

## Passo 8: Configurar GitHub Actions (opcional, mas recomendado)

### Criar secret NPM_TOKEN no GitHub:

1. No npm, gere um token de acesso:
   - Acesse: https://www.npmjs.com/settings/~/tokens
   - Clique "Generate New Token" → "Classic Token"
   - Tipo: "Automation"
   - Copie o token

2. No GitHub, adicione como secret:
   - Vá para: `https://github.com/SEU-USUARIO/claude-sync/settings/secrets/actions`
   - Clique "New repository secret"
   - Nome: `NPM_TOKEN`
   - Valor: (cole o token do npm)
   - Clique "Add secret"

Agora os workflows em `.github/workflows/` funcionarão automaticamente:
- `ci.yml` — testa em cada PR
- `publish.yml` — publica no npm quando você criar uma tag `v*`

---

## Passo 9: Publicar uma release no GitHub (opcional)

Depois de publicar no npm, crie uma release no GitHub:

```bash
# Via GitHub CLI
gh release create v1.0.1 --title "v1.0.1" --notes "Initial release

## Features
- Sync Claude Code config using GitHub Gists
- 8 CLI commands (init, push, pull, status, share, import, link, unlink)
- Automatic backups and conflict resolution

## Bug Fixes
- Fixed token persistence after init/link"

# OU via web
# Vá para: https://github.com/SEU-USUARIO/claude-sync/releases/new
```

---

## Passo 10: Verificar publicação

```bash
# Verificar no npm
npm view claude-sync

# Instalar globalmente
npm install -g claude-sync

# Testar
claude-sync --version
```

---

## Comandos úteis

### Despublicar (CUIDADO! Só nas primeiras 72h):
```bash
npm unpublish claude-sync@1.0.1
```

### Deprecar uma versão:
```bash
npm deprecate claude-sync@1.0.0 "Use 1.0.1 or higher"
```

### Ver estatísticas de downloads:
```bash
npm view claude-sync downloads
```

---

## Checklist final antes de publicar

- [ ] README.md está completo e claro
- [ ] LICENSE está presente
- [ ] package.json tem todas as informações corretas
- [ ] `npm run build` funciona
- [ ] `npm test` passa
- [ ] .gitignore está correto
- [ ] Arquivos desnecessários não estão no pacote (verificar com `npm pack --dry-run`)
- [ ] Versão está correta
- [ ] Repositório no GitHub está criado e com código enviado
- [ ] Logado no npm (`npm whoami`)

---

## Fluxo rápido (resumo)

```bash
# 1. GitHub
gh repo create claude-sync --public --source=. --push

# 2. npm
npm login
npm run build
npm test
npm publish --access public

# 3. Verificar
npm view claude-sync
npm install -g claude-sync
claude-sync --version
```

Pronto! Seu pacote está publicado e disponível para o mundo. 🚀
