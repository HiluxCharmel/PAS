# Guide d'Installation - Portail ZS-PAS

## Prérequis

- Node.js 18+ (pour le développement local)
- Compte Supabase (gratuit : https://supabase.com)
- Compte Netlify ou Vercel (pour le déploiement)
- Git

## 1. Configuration Supabase

### Créer un projet Supabase

1. Allez sur https://supabase.com/dashboard
2. Cliquez sur "New Project"
3. Choisissez votre organisation
4. Nom du projet : `zs-pas-portal`
5. Mot de passe de base de données : [générez un mot de passe fort]
6. Région : `eu-west-1` (Europe) ou la plus proche
7. Cliquez sur "Create new project"

### Exécuter le schéma SQL

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Cliquez sur "New Query"
3. Copiez-collez le contenu de `sql/schema.sql`
4. Cliquez sur "Run" (peut prendre 30-60 secondes)

### Configurer l'authentification

1. Allez dans **Authentication** → **Settings**
2. **Site URL** : `https://votre-domaine.netlify.app` (ou `http://localhost:3000` en dev)
3. **Redirect URLs** : Ajoutez `https://votre-domaine.netlify.app/**`
4. Désactivez "Enable email confirmations" pour les tests (réactivez en production)
5. Dans **Email Templates**, personnalisez si souhaité

### Configurer le Storage

1. Allez dans **Storage**
2. Créez 3 buckets :
   - `public-documents` (Public : ON)
   - `facility-images` (Public : ON)
   - `user-avatars` (Public : OFF)
3. Pour chaque bucket, ajoutez la policy :
   ```sql
   -- Public read for public buckets
   CREATE POLICY "Public read" ON storage.objects
   FOR SELECT USING (bucket_id = 'public-documents');

   -- Authenticated upload
   CREATE POLICY "Authenticated upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'public-documents' AND auth.role() = 'authenticated');
   ```

### Récupérer les clés API

1. Allez dans **Settings** → **API**
2. Notez :
   - **Project URL** (ex: `https://abcdef.supabase.co`)
   - **anon public** key (clé publique)
   - **service_role** key (clé secrète - NE JAMAIS l'exposer côté client)

## 2. Configuration du Frontend

### Modifier la configuration Supabase

Éditez `js/supabase-config.js` :

```javascript
export const SUPABASE_CONFIG = {
  url: 'VOTRE_PROJECT_URL',
  anonKey: 'VOTRE_ANON_KEY',
  // ...
};
```

### Variables d'environnement (recommandé)

Créez un fichier `.env` à la racine (ne pas commiter) :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

Et modifiez `supabase-config.js` pour utiliser `import.meta.env.VITE_SUPABASE_URL`.

## 3. Développement Local

### Option A : Serveur statique simple

```bash
# Avec Python
cd portail-zs-pas
python -m http.server 3000

# Ou avec Node.js (si installé)
npx serve .
```

### Option B : VS Code Live Server

1. Installez l'extension "Live Server"
2. Clic droit sur `index.html` → "Open with Live Server"

### Option C : Netlify CLI (recommandé pour tester les Edge Functions)

```bash
npm install -g netlify-cli
netlify dev
```

## 4. Créer les premiers utilisateurs

### Via Supabase Dashboard

1. **Authentication** → **Users** → "Add User"
2. Email : `admin@zs-pas.sante.gouv.bj`
3. Mot de passe : [fort]
4. Email Confirm : ON
5. User Metadata : `{"role": "super_admin", "full_name": "Dr Alphonse KOSSI"}`
6. Cliquez "Create User"

Répétez pour :
- `validateur@zs-pas.sante.gouv.bj` (role: `validator`)
- `agent@zs-pas.sante.gouv.bj` (role: `main_admin`)

### Via SQL (alternative)

```sql
-- Dans SQL Editor
SELECT auth.admin_create_user(
  email := 'admin@zs-pas.sante.gouv.bj',
  password := 'MotDePasseFort123!',
  email_confirm := true,
  user_metadata := '{"role": "super_admin", "full_name": "Dr Alphonse KOSSI"}'::jsonb
);
```

## 5. Déploiement sur Netlify

### Méthode 1 : Git (Recommandée)

1. Poussez le code sur GitHub/GitLab
2. Sur Netlify : "Add new site" → "Import from Git"
3. Connectez votre repo
4. Build settings :
   - Build command : (laisser vide pour site statique)
   - Publish directory : `portail-zs-pas`
5. Variables d'environnement (Site Settings → Environment Variables) :
   ```
   VITE_SUPABASE_URL = https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY = votre-cle-anon
   ```
6. Deploy !

### Méthode 2 : Netlify CLI

```bash
cd portail-zs-pas
netlify deploy --prod --dir=.
```

### Configurer les redirects (pour SPA)

Créez `public/_redirects` :

```
/*    /index.html   200
```

Et `public/_headers` pour la sécurité :

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

## 6. Configuration DNS (Domaine personnalisé)

1. Dans Netlify : **Domain Settings** → "Add custom domain"
2. Suivez les instructions pour configurer vos DNS (CNAME vers `votre-site.netlify.app`)
3. Activez HTTPS (automatique avec Let's Encrypt)
4. Mettez à jour **Site URL** dans Supabase Auth Settings

## 7. Configuration des Edge Functions (Optionnel)

Pour l'envoi d'emails/SMS automatiques :

1. Créez `supabase/functions/send-email/index.ts`
2. Déployez : `supabase functions deploy send-email`
3. Ajoutez les variables d'environnement dans Supabase Dashboard → Settings → Edge Functions

## 8. Vérification Post-Déploiement

- [ ] Page d'accueil se charge
- [ ] Navigation fonctionne
- [ ] Page "Centres" affiche la carte et la liste
- [ ] Formulaire "Rendez-vous" soumet (vérifiez dans Supabase → Table Editor)
- [ ] Formulaire "Contact" fonctionne
- [ ] Connexion admin (`/admin/connexion.html`) fonctionne
- [ ] Tableau de bord admin affiche les stats
- [ ] RLS fonctionne (testez avec un compte reader)
- [ ] Pas de clés secrètes dans le code source (grep `service_role`)

## 9. Maintenance

### Sauvegardes

Supabase fait des sauvegardes automatiques quotidiennes (rétention 7 jours sur le plan gratuit).
Pour plus : plan Pro ou script pg_dump programmé.

### Mises à jour

```bash
# Pull latest
git pull

# Rebuild & deploy
netlify deploy --prod --dir=portail-zs-pas
```

### Monitoring

- Supabase Dashboard → Logs (API, Auth, Database)
- Netlify Dashboard → Functions logs, Analytics
- Configurez des alertes Uptime (UptimeRobot, Pingdom)

## Dépannage

### "Failed to fetch" / Erreur CORS
- Vérifiez que l'URL du site est dans les Redirect URLs Supabase
- Vérifiez que `anonKey` est correct

### RLS bloque l'accès
- Vérifiez les politiques dans Supabase → Authentication → Policies
- Testez avec `service_role` en local pour debugger

### Carte ne s'affiche pas
- Vérifiez que Leaflet CSS/JS sont chargés
- Console navigateur pour erreurs JS

### Connexion admin échoue
- Vérifiez que l'utilisateur existe dans `profiles` avec le bon rôle
- Vérifiez `auth.users` → email_confirmed_at n'est pas NULL

## Support

- Documentation Supabase : https://supabase.com/docs
- Netlify Docs : https://docs.netlify.com
- Leaflet : https://leafletjs.com
- Tailwind CSS : https://tailwindcss.com