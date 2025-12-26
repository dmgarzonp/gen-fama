# 🔐 Solución al Error de Autenticación

## Problema
```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Autenticación falló
```

## Solución: Usar Token en la URL (Método más directo)

### Opción 1: Push con Token en la URL (Una vez)

```bash
# Reemplaza TU_TOKEN con el token que obtuviste de GitHub
git push https://TU_TOKEN@github.com/dmgarzonp/gen-fama.git master
```

**Ejemplo:**
```bash
git push https://ghp_abc123xyz@github.com/dmgarzonp/gen-fama.git master
```

### Opción 2: Configurar Token en la URL del Remoto (Permanente)

```bash
# 1. Obtén tu token de: https://github.com/settings/tokens
# 2. Configura el remoto con el token:
git remote set-url origin https://TU_TOKEN@github.com/dmgarzonp/gen-fama.git

# 3. Haz push normalmente:
git push -u origin master
```

**⚠️ IMPORTANTE:** Si usas este método, el token quedará visible en `.git/config`. 
Es mejor usar la Opción 3 para mayor seguridad.

### Opción 3: Usar Git Credential Helper (Recomendado)

```bash
# 1. Limpia credenciales anteriores (ya hecho)
# 2. Configura el helper
git config --global credential.helper store

# 3. Haz push (te pedirá usuario y token)
git push -u origin master
# Username: dmgarzonp
# Password: [PEGA_TU_TOKEN_AQUI]
```

### Opción 4: Usar GitHub CLI (gh)

Si tienes GitHub CLI instalado:

```bash
# Instalar GitHub CLI (si no lo tienes)
# Ubuntu/Debian:
sudo apt install gh

# Autenticarse
gh auth login

# Luego hacer push normalmente
git push -u origin master
```

## 📝 Cómo Obtener el Token

1. Ve a: https://github.com/settings/tokens
2. Click: "Generate new token" → "Generate new token (classic)"
3. Nombre: `Gen-fama Local`
4. Expiración: 90 días o más
5. Permisos: Marca **`repo`**
6. Click: "Generate token"
7. **Copia el token** (solo se muestra una vez)

El token se verá así: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

