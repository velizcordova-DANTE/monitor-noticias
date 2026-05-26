# Instrucciones para desplegar cambios a Render

## Cada vez que hagas cambios en `api-server.js`

1. Abrí PowerShell y ejecutá:

```powershell
cd C:\proyecto\monitor-noticias\monitor-noticias
git add api-server.js
git commit -m "descripción de los cambios"
git push origin master
```

2. Te va a pedir usuario y contraseña de GitHub:
   - **Usuario:** tu email o nombre de usuario de GitHub
   - **Contraseña:** tu **Personal Access Token** de GitHub (no tu contraseña normal)

3. Esperá 2-3 minutos y Render se despliega solo.

## Cómo probar los cambios

Después del deploy, visitá desde tu navegador:

- **Probar Telegram:** `https://monitor-noticias-jcwg.onrender.com/api/test-telegram`
  → Te llega un mensaje a Telegram si el bot funciona.
- **Ver datos de RRSS:** `https://monitor-noticias-jcwg.onrender.com/api/social-posts`

## Para obtener un Personal Access Token de GitHub

1. Andá a https://github.com/settings/tokens
2. Click en "Generate new token (classic)"
3. Seleccioná el scope `repo` (primer checkbox)
4. Copiá el token y guardalo en un bloc de notas
5. Usá ese token como contraseña cuando git lo pida

## Cambios realizados el 25/05/2026

- ✅ **Amplié SALUD_KEYWORDS** de ~20 a 150+ palabras clave (enfermedades, especialidades, tratamientos, etc.)
- ✅ **Agregué `/api/test-telegram`** para probar el bot manualmente
- ✅ **Corregí la URL de Telegram** — ahora apunta a Render, no a localhost
