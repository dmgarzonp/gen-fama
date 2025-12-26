# Cómo subir el código con Token de Acceso Personal

## Opción 1: Usar Token en la URL (temporal)

```bash
git push -u origin master
# Cuando pida usuario: dmgarzonp
# Cuando pida contraseña: PEGA_TU_TOKEN_AQUI
```

## Opción 2: Configurar Git Credential Helper (recomendado)

```bash
# Configurar para guardar las credenciales
git config --global credential.helper store

# Luego hacer push (pedirá usuario y token una vez)
git push -u origin master
```

## Opción 3: Usar SSH (más seguro a largo plazo)

1. Genera una clave SSH si no tienes una:
```bash
ssh-keygen -t ed25519 -C "tu_email@ejemplo.com"
```

2. Agrega la clave pública a GitHub:
   - Copia el contenido de: `~/.ssh/id_ed25519.pub`
   - Ve a: https://github.com/settings/keys
   - Click "New SSH key"
   - Pega la clave y guarda

3. Cambia el remoto a SSH:
```bash
git remote set-url origin git@github.com:dmgarzonp/gen-fama.git
git push -u origin master
```

