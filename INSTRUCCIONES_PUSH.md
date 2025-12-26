# 📤 Instrucciones para Subir el Código a GitHub

## ✅ Remoto Configurado
El repositorio remoto ya está configurado: `https://github.com/dmgarzonp/gen-fama.git`

## 🔐 Autenticación con GitHub

GitHub ya no acepta contraseñas normales. Necesitas un **Token de Acceso Personal**.

### Paso 1: Crear Token de Acceso Personal

1. Ve a: https://github.com/settings/tokens
2. Click en: **"Generate new token"** → **"Generate new token (classic)"**
3. Nombre: `Gen-fama Local`
4. Expiración: Elige una (90 días, 1 año, o sin expiración)
5. Permisos: Marca **`repo`** (acceso completo a repositorios)
6. Click en: **"Generate token"**
7. **¡IMPORTANTE!** Copia el token inmediatamente (solo se muestra una vez)
   - Se verá algo como: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Paso 2: Subir el Código

Ejecuta este comando:

```bash
git push -u origin master
```

Cuando te pida:
- **Username**: `dmgarzonp`
- **Password**: Pega el **token** que copiaste (no tu contraseña de GitHub)

### Paso 3: Verificar

Después del push, ve a tu repositorio:
**https://github.com/dmgarzonp/gen-fama**

Deberías ver todos tus archivos ahí.

---

## 🔄 Para Futuros Cambios

Una vez configurado, solo necesitas:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Ya no te pedirá usuario/contraseña porque se guardó en `~/.git-credentials`.

