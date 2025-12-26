# Configuración de GitHub para Gen-farma

## Pasos para subir el proyecto a GitHub

### 1. Crear el repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `Gen-farma` (o el que prefieras)
3. Descripción: "Sistema de gestión para farmacia - POS, Caja, Inventario"
4. Elige si será **Private** o **Public**
5. **NO marques** "Initialize with README" (ya tienes archivos locales)
6. Haz clic en **"Create repository"**

### 2. Conectar el repositorio local con GitHub

Después de crear el repositorio, GitHub te mostrará comandos. Usa estos comandos (reemplaza `TU_USUARIO` con tu usuario de GitHub):

```bash
# Agregar el remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/Gen-farma.git

# O si prefieres usar SSH (si tienes configuradas las claves SSH):
# git remote add origin git@github.com:TU_USUARIO/Gen-farma.git

# Verificar que se agregó correctamente
git remote -v

# Subir el código a GitHub
git branch -M main  # Renombrar la rama a 'main' (opcional, GitHub usa 'main' por defecto)
git push -u origin main  # O 'master' si tu rama se llama así
```

### 3. Si tu rama se llama 'master' en lugar de 'main'

```bash
# Verificar el nombre de tu rama actual
git branch

# Si se llama 'master', puedes renombrarla o simplemente hacer push a master:
git push -u origin master
```

### 4. Verificar que todo se subió correctamente

Después del push, ve a tu repositorio en GitHub y verifica que todos los archivos estén ahí.

## Comandos útiles para el futuro

```bash
# Ver el estado de los cambios
git status

# Agregar archivos modificados
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios a GitHub
git push

# Descargar cambios de GitHub
git pull

# Ver el historial de commits
git log --oneline
```

## Nota importante

El archivo `.gitignore` está configurado para **NO subir**:
- `node_modules/` (dependencias)
- `dist/` (archivos compilados)
- `*.db`, `*.sqlite` (bases de datos)
- Archivos de configuración local

Esto es correcto y necesario para mantener el repositorio limpio.

