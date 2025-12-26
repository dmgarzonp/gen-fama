#!/bin/bash
# Script para subir el código a GitHub
# Ejecuta este script DESPUÉS de crear el repositorio en GitHub

echo "Subiendo código a GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo "✅ ¡Código subido exitosamente a GitHub!"
    echo "Visita: https://github.com/dmgarzonp/Gen-farma"
else
    echo "❌ Error al subir. Asegúrate de haber creado el repositorio en GitHub primero."
    echo "Ve a: https://github.com/new"
fi


