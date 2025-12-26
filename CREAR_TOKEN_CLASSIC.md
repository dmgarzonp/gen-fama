# 🔑 Crear Token Classic (Solución Recomendada)

Los tokens fine-grained pueden tener restricciones adicionales que causan problemas. Te recomiendo crear un **token classic** que es más simple y confiable.

## 📝 Pasos para Crear Token Classic

### 1. Ir a la Configuración de Tokens

Ve a: https://github.com/settings/tokens

### 2. Crear Token Classic

1. Click en: **"Generate new token"**
2. Selecciona: **"Generate new token (classic)"**
3. Nombre: `Gen-fama Classic`
4. Expiración: Elige una (90 días, 1 año, o sin expiración)
5. Permisos: Marca **`repo`** (esto incluye todo lo necesario para push/pull)
6. Click en: **"Generate token"**

### 3. Copiar el Token

- El token empezará con `ghp_` (no `github_pat_`)
- **Copia el token inmediatamente** (solo se muestra una vez)

### 4. Usar el Token

Una vez que tengas el token classic (que empieza con `ghp_`), ejecuta:

```bash
# Reemplaza ghp_TU_TOKEN con el token que copiaste
git remote set-url origin https://ghp_TU_TOKEN@github.com/dmgarzonp/gen-fama.git
git push -u origin main
```

O directamente:

```bash
git push https://ghp_TU_TOKEN@github.com/dmgarzonp/gen-fama.git main
```

## ✅ Ventajas del Token Classic

- ✅ Más simple y directo
- ✅ Funciona mejor con Git
- ✅ Menos restricciones
- ✅ Más confiable para operaciones básicas

## ⚠️ Nota de Seguridad

El token quedará visible en `.git/config` si lo pones en la URL del remoto. Para mayor seguridad, puedes usar:

```bash
git config credential.helper store
git push -u origin main
# Cuando pida usuario: dmgarzonp
# Cuando pida contraseña: pega el token
```

Esto guardará el token de forma segura.

