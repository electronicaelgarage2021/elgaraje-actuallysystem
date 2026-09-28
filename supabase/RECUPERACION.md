# Plan de recuperación — El Garage

Qué hacer si algo sale mal con la base de datos. Pensado para que cualquiera lo siga, paso a paso.

## Dónde están los backups
- Carpeta local: `C:\Mati\ChatGPT\02_Code\04_El Garage\data\backups\<fecha>\` (un JSON por tabla y `_resumen.json`; no genera CSV).
- Copia fuera de esta PC: pendiente de verificar y automatizar.
- Supabase está en plan Free (verificado el 27/09/2026): el plan no incluye backups diarios automáticos de la plataforma. Depender del backup local hasta confirmar una copia externa.

## Hacer un backup ahora mismo
```powershell
cd "C:\Mati\ChatGPT\02_Code\04_El Garage\codigo\elgarage-system\app"
$env:NEXT_PUBLIC_SUPABASE_URL = (Get-Content .env.local | Select-String "NEXT_PUBLIC_SUPABASE_URL=").ToString().Split("=",2)[1]
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = (Get-Content .env.local | Select-String "SUPABASE_SERVICE_ROLE_KEY=").ToString().Split("=",2)[1]
node scripts/backup.mjs
```
(usa la service_role key porque la base está cerrada por RLS)

## Verificar que un backup esté completo
```powershell
node scripts/verify-backup.mjs "C:\Mati\ChatGPT\02_Code\04_El Garage\data\backups\<fecha>"
```

## Restaurar datos desde un backup JSON
1. **Primero hacé un backup del estado actual** (por las dudas).
2. Probá en DRY-RUN (no escribe nada):
   ```powershell
   node scripts/restore.mjs "C:\Mati\ChatGPT\02_Code\04_El Garage\data\backups\<fecha>"
   ```
3. Si se ve bien, restaurá de verdad (necesita credenciales del proyecto destino):
   ```powershell
   $env:RESTORE_SUPABASE_URL = "<URL del proyecto destino de prueba>"
   $env:RESTORE_SUPABASE_KEY = "<service_role key>"   # del vault: supabase/EL_GARAGE_SERVICE_ROLE.md
   node scripts/restore.mjs "C:\Mati\ChatGPT\02_Code\04_El Garage\data\backups\<fecha>" --apply
   ```
   El restore hace UPSERT por id: inserta filas faltantes y **sobrescribe las filas existentes con el mismo id**. Usar primero un proyecto de prueba; nunca aplicar sobre producción sin revisar el resultado del DRY-RUN y hacer un backup nuevo.

## Casos comunes

### "Borré algo sin querer"
- Si fue poco: restaurá primero en un proyecto de prueba y compará los registros; el UPSERT también puede sobrescribir cambios posteriores al backup.
- Si fue un borrado masivo: el **trigger anti-borrado** debería haberlo bloqueado (máx 50 filas). Si igual pasó, restaurá del backup.

### "La app muestra todo vacío de golpe"
- Casi seguro es un problema de la service_role key en Vercel (env var borrada/cambiada).
- Revisá Vercel → Environment Variables → `SUPABASE_SERVICE_ROLE_KEY` (valor en el vault).
- La base NO se perdió; es un problema de acceso.

### "No puedo entrar (login)"
- Revisá en Vercel que estén configuradas APP_PIN y SESSION_SECRET (valores en el vault).
- Tras cambiar una env var en Vercel hay que **redeploy** (un push vacío lo gatilla).

## Credenciales (en el vault, NO acá)
- service_role key: `C:\Users\MatiasG\.vault\supabase\EL_GARAGE_SERVICE_ROLE.md`
- SESSION_SECRET: `C:\Users\MatiasG\.vault\elgarage\SESSION_SECRET.md`
- Cuenta GitHub/Supabase: `~/.claude/.../memory/reference_elgarage_credentials.md`
