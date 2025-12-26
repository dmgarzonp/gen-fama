# 🔧 Push Manual con Token

El token que proporcionaste es un **fine-grained token** (`github_pat_...`). Estos tokens pueden tener restricciones específicas.

## Verificar el Token

1. Ve a: https://github.com/settings/tokens
2. Busca el token que creaste
3. Verifica que tenga estos permisos:
   - ✅ **Repository access**: "All repositories" o específicamente "gen-fama"
   - ✅ **Permissions**: 
     - Contents: Read and write
     - Metadata: Read-only

## Método Alternativo: Usar GitHub CLI

Si el token no funciona directamente, puedes usar GitHub CLI:

```bash
# Instalar GitHub CLI (si no lo tienes)
sudo apt install gh

# Autenticarse con el token
gh auth login --with-token <<EOF
TU_TOKEN_AQUI
EOF

# Luego hacer push
git push -u origin main
```

## Método Directo: Verificar Repositorio

Asegúrate de que:
1. El repositorio existe: https://github.com/dmgarzonp/gen-fama
2. Tienes acceso de escritura
3. El token tiene permisos para ese repositorio específico

## Crear un Token Classic (Alternativa)

Si el fine-grained token no funciona, crea un **classic token**:

1. Ve a: https://github.com/settings/tokens
2. Click: "Generate new token" → "Generate new token (classic)"
3. Nombre: `Gen-fama Classic`
4. Permisos: Marca **`repo`**
5. Genera y copia el token (empezará con `ghp_`)
6. Úsalo en el push:

```bash
git push https://ghp_TU_TOKEN_CLASSIC@github.com/dmgarzonp/gen-fama.git main
```

