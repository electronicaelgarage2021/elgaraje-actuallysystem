# Plan de recuperación — El Garage

Qué hacer si algo sale mal con la base de datos. Pensado para que cualquiera lo siga, paso a paso.

## Dónde están los backups
- Carpeta local: `C:\Users\MatiasG\Backups\elgarage\<fecha>\` (un JSON por tabla + CSVs).
- Copia en la nube: Google Drive (subir cada backup nuevo).
- Backups automáticos de Supabase: Dashboard → Database → Backups (diarios, retención según el plan).

## Hacer un backup ahora mismo
```powershell
cd C:\Users\MatiasG\projects\elgarage-system\app
$env:NEXT_PUBLIC_SUPABASE_URL = (Get-Content .env.local | Select-String "NEXT_PUBLIC_SUPABASE_URL=").ToString().Split("=",2)[1]
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = (Get-Content .env.local | Select-String "SUPABASE_SERVICE_ROLE_KEY=").ToString().Split("=",2)[1]
node scripts/backup.mjs
```
(usa la service_role key porque la base está cerrada por RLS)

## Verificar que un backup esté completo
```powershell
node scripts/verify-backup.mjs "C:\Users\MatiasG\Backups\elgarage\<fecha>"
```

## Restaurar datos desde un backup JSON
1. **Primero hacé un backup del estado actual** (por las dudas).
2. Probá en DRY-RUN (no escribe nada):
   ```powershell
   node scripts/restore.mjs "C:\Users\MatiasG\Backups\elgarage\<fecha>"
   ```
3. Si se ve bien, restaurá de verdad (necesita credenciales del proyecto destino):
   ```powershell
   $env:RESTORE_SUPABASE_URL = "https://piwthwqgmcrndiwbdmiy.supabase.co"
   $env:RESTORE_SUPABASE_KEY = "<service_role key>"   # del vault: supabase/EL_GARAGE_SERVICE_ROLE.md
   node scripts/restore.mjs "C:\Users\MatiasG\Backups\elgarage\<fecha>" --apply
   ```
   El restore hace UPSERT por id (no duplica) y respeta el orden de las foreign keys.

## Casos comunes

### "Borré algo sin querer"
- Si fue poco: restaurá desde el último backup (upsert no pisa lo nuevo, recupera lo borrado).
- Si fue un borrado masivo: el **trigger anti-borrado** debería haberlo bloqueado (máx 50 filas). Si igual pasó, restaurá del backup.

### "La app muestra todo vacío de golpe"
- Casi seguro es un problema de la service_role key en Vercel (env var borrada/cambiada).
- Revisá Vercel → Environment Variables → `SUPABASE_SERVICE_ROLE_KEY` (valor en el vault).
- La base NO se perdió; es un problema de acceso.

### "No puedo entrar (login)"
- Revisá en Vercel que estén `APP_PIN` (= 111111) y `SESSION_SECRET`.
- Tras cambiar una env var en Vercel hay que **redeploy** (un push vacío lo gatilla).

## Credenciales (en el vault, NO acá)
- service_role key: `C:\Users\MatiasG\.vault\supabase\EL_GARAGE_SERVICE_ROLE.md`
- SESSION_SECRET: `C:\Users\MatiasG\.vault\elgarage\SESSION_SECRET.md`
- Cuenta GitHub/Supabase: `~/.claude/.../memory/reference_elgarage_credentials.md`
