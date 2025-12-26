# 🔐 Permisos Requeridos para el Token de GitHub

## ✅ Permisos Necesarios para Hacer Push

Para que tu token fine-grained (`github_pat_...`) pueda hacer push al repositorio, necesita:

### 1. Repository Access (Acceso al Repositorio)
- ✅ **"All repositories"** (recomendado)
- O específicamente: **"gen-fama"** debe estar seleccionado

### 2. Repository Permissions (Permisos del Repositorio)

#### Obligatorio:
- ✅ **Contents**: **Read and write** ⚠️ (ESENCIAL para hacer push)

#### Recomendado:
- ✅ **Metadata**: **Read-only** (para información básica)

## 📝 Cómo Verificar y Corregir los Permisos

### Paso 1: Ir a la Configuración del Token

1. Ve a: https://github.com/settings/tokens
2. Busca tu token fine-grained
3. Haz clic en el nombre del token para editarlo

### Paso 2: Verificar Repository Access

En la sección **"Repository access"**:
- Debe estar marcado: **"All repositories"**
- O si está en "Only select repositories", asegúrate de que **"gen-fama"** esté en la lista

### Paso 3: Verificar Repository Permissions

En la sección **"Repository permissions"** → **"Contents"**:
- Debe estar en: **"Read and write"** (NO solo "Read-only")

### Paso 4: Guardar Cambios

1. Haz clic en **"Save"** o **"Update token"**
2. Espera unos segundos para que los cambios se apliquen

### Paso 5: Intentar Push de Nuevo

```bash
git push -u origin main
```

## 🔄 Alternativa: Crear Token Classic (Más Simple)

Si los tokens fine-grained te dan problemas, crea un **token classic** que es más directo:

### Pasos para Token Classic:

1. Ve a: https://github.com/settings/tokens
2. Click: **"Generate new token"** → **"Generate new token (classic)"**
3. Nombre: `Gen-fama Classic`
4. Expiración: 90 días o más
5. Permisos: Marca **`repo`** (esto incluye todo lo necesario)
6. Click: **"Generate token"**
7. Copia el token (empezará con `ghp_`)

### Usar el Token Classic:

```bash
git remote set-url origin https://ghp_TU_TOKEN_CLASSIC@github.com/dmgarzonp/gen-fama.git
git push -u origin main
```

## ⚠️ Resumen de Permisos Mínimos

Para hacer push necesitas:
- ✅ Acceso al repositorio `gen-fama`
- ✅ **Contents: Read and write** (el más importante)

Si el token solo tiene "Read-only" en Contents, no podrás hacer push.

