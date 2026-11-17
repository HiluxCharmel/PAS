# Guide de Déploiement - Portail ZS-PAS

## Architecture de Déploiement

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Netlify       │────▶│   Supabase       │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)      │     │   (Database)    │
│                 │     │                  │     │                 │
│ - HTML/CSS/JS   │     │ - Auth           │     │ - Tables + RLS  │
│ - Assets        │     │ - Database       │     │ - Functions     │
│ - Edge Functions│     │ - Storage        │     │ - Triggers      │
│ - CDN Global    │     │ - Realtime       │     │ - Backups       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Environnements

| Environnement | URL | Branche | Usage |
|--------------|-----|---------|-------|
| Production | `https://zs-pas.sante.gouv.bj` | `main` | Public |
| Staging | `https://staging-zs-pas.netlify.app` | `staging` | Tests |
| Développement | `http://localhost:3000` | `feature/*` | Local |

## Pipeline CI/CD (Netlify)

### Configuration `netlify.toml`

```toml
[build]
  publish = "portail-zs-pas"
  command = "echo 'Static site - no build step'"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(self)"
    Content-Security-Policy = "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://fonts.googleapis.com https://fonts.gstatic.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["admin"]}

[[redirects]]
  from = "/admin/*"
  to = "/admin/:splat"
  status = 200
```

### Variables d'Environnement Netlify

**Site Settings → Build & Deploy → Environment Variables**

| Variable | Valeur | Description |
|----------|--------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | URL projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Clé publique anon |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | **SECRET** - Pour Edge Functions uniquement |
| `SENDGRID_API_KEY` | `SG.xxx` | Pour emails transactionnels |
| `TWILIO_ACCOUNT_SID` | `ACxxx` | Pour SMS |
| `TWILIO_AUTH_TOKEN` | `xxx` | Pour SMS |
| `TWILIO_PHONE_NUMBER` | `+229XXXXXXXX` | Numéro expéditeur SMS |

> ⚠️ **Jamais** de `service_role` dans les variables frontend (VITE_)

## Déploiement Manuel

### Via Netlify CLI

```bash
# Installation
npm install -g netlify-cli

# Login
netlify login

# Déployer en production
cd portail-zs-pas
netlify deploy --prod --dir=.

# Déployer en preview (branch deploy)
netlify deploy --dir=.
```

### Via Git Push (Auto-deploy)

```bash
# Configuration une fois
netlify init  # Lie le repo au site Netlify

# Ensuite, chaque push sur main déclenche le déploiement
git push origin main
```

## Configuration Supabase pour Production

### 1. Désactiver les inscriptions publiques

Dashboard → Authentication → Settings :
- **Enable email confirmations** : ON
- **Enable phone confirmations** : ON (si SMS configuré)
- **Enable signup** : OFF (création users via admin seulement)

### 2. Configurer les providers OAuth (optionnel)

Si authentification via Google/Microsoft pour les agents :
- Authentication → Providers → Google/Entra ID
- Ajoutez Client ID/Secret
- Redirect URL : `https://votre-domaine.com/auth/callback`

### 3. Configurer les Edge Functions

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier le projet
supabase link --project-ref VOTRE_PROJECT_REF

# Déployer les fonctions
supabase functions deploy send-email --no-verify-jwt
supabase functions deploy send-sms --no-verify-jwt
supabase functions deploy generate-pdf --no-verify-jwt
```

### 4. Configurer les Webhooks (optionnel)

Pour notifications temps réel vers systèmes externes :
- Database → Webhooks → New webhook
- Table : `appointments`, `contact_requests`, `announcements`
- Events : `INSERT`, `UPDATE`
- URL : votre endpoint (ex: système de ticketing)

## Checklist Pré-Production

### Frontend
- [ ] Toutes les pages se chargent sans erreur console
- [ ] Navigation fonctionne (menu mobile + desktop)
- [ ] Formulaires valident côté client
- [ ] Carte Leaflet s'affiche avec marqueurs
- [ ] Images optimisées (WebP, tailles responsives)
- [ ] Favicon + manifest PWA présents
- [ ] Pas de `console.log` / `debugger` en prod
- [ ] Tailwind CSS purgé (classes inutilisées supprimées)

### Backend (Supabase)
- [ ] RLS activée sur **toutes** les tables
- [ ] Politiques testées avec chaque rôle
- [ ] `service_role` **jamais** côté client
- [ ] Index créés sur colonnes filtrées
- [ ] Triggers `updated_at` fonctionnels
- [ ] Fonctions `generate_reference` testées
- [ ] Buckets Storage avec bonnes policies
- [ ] Sauvegardes automatiques activées (quotidiennes)

### Sécurité
- [ ] HTTPS forcé (HSTS)
- [ ] Headers de sécurité configurés (CSP, X-Frame-Options, etc.)
- [ ] CSP autorise seulement domaines nécessaires
- [ ] Pas de secrets dans le code source (`grep -r "service_role\|password\|secret"`)
- [ ] Rate limiting sur formulaires publics (Edge Function)
- [ ] reCAPTCHA / hCaptcha sur formulaires (optionnel)

### Performance
- [ ] Assets servis via CDN (Netlify auto)
- [ ] Compression Brotli/Gzip activée
- [ ] Cache headers sur assets statiques (1 an)
- [ ] Pas de ressources bloquantes au chargement
- [ ] Lazy loading images (native `loading="lazy"`)
- [ ] Code splitting JS (modules ES dynamiques)

### Accessibilité
- [ ] Contraste WCAG AA minimum (7:1 texte, 4.5:1 UI)
- [ ] Navigation clavier complète
- [ ] Labels sur tous inputs
- [ ] Alt text sur toutes images
- [ ] ARIA labels où nécessaire
- [ ] Skip link présent
- [ ] Focus visible clair

### Conformité
- [ ] Politique de confidentialité accessible
- [ ] Mentions légales accessibles
- [ ] Avertissement médical sur pages concernées
- [ ] Cookies : seulement strictement nécessaires
- [ ] RGPD/APDP : DPO contact visible
- [ ] Mentions "Gratuité" exactes selon textes officiels

## Tests de Non-Régression

### Script de test manuel (checklist)

```bash
# 1. Page d'accueil
- [ ] Hero stats s'affichent
- [ ] Cartes accès rapide cliquables
- [ ] Actualités (3 dernières) visibles
- [ ] Documents à la une (3) visibles
- [ ] Avertissement médical visible

# 2. Centres de santé
- [ ] Liste s'affiche (4+ centres)
- [ ] Filtres commune/arrondissement/type fonctionnent
- [ ] Recherche textuelle filtre en temps réel
- [ ] Carte Leaflet charge + marqueurs
- [ ] Clic marqueur → popup infos
- [ ] Bouton "Appel" ouvre dialer
- [ ] Bouton "Itinéraire" ouvre OSM
- [ ] Compteur structures mis à jour

# 3. Rendez-vous
- [ ] Avertissement médical affiché
- [ ] Formulaire validation côté client
- [ ] Date min = demain (jours ouvrés)
- [ ] Weekends grisés/non sélectionnables
- [ ] Soumission → référence générée
- [ ] Carte confirmation affichée
- [ ] Suivi par référence fonctionne

# 4. Contact
- [ ] Type change → sujets mis à jour
- [ ] Validation email/téléphone
- [ ] Compteur caractères message
- [ ] Soumission → message succès
- [ ] FAQ accordéon fonctionnel

# 5. Admin
- [ ] Connexion avec 2FA
- [ ] Tableau de bord KPIs
- [ ] Onglet centres CRUD
- [ ] Onglet actualités workflow
- [ ] Onglet RDV confirmation
- [ ] Onglet réclamations réponse
- [ ] Journal audit lisible
- [ ] Déconnexion nettoie session

# 6. Responsive (Chrome DevTools)
- [ ] Mobile 375px : tout lisible, boutons 48px+
- [ ] Tablette 768px : grille 2 colonnes
- [ ] Desktop 1280px : grille 3-4 colonnes
- [ ] Menu hamburger mobile
- [ ] Sidebar admin mobile (overlay)
```

### Tests Automatisés (Optionnel - Playwright)

```javascript
// tests/e2e.spec.js
import { test, expect } from '@playwright/test';

test('Homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Zone Sanitaire');
});

test('Centres page filters work', async ({ page }) => {
  await page.goto('/centres.html');
  await page.selectOption('#filter-commune', 'porto-novo');
  await expect(page.locator('.facility-card')).toHaveCountGreaterThan(0);
});

test('Appointment form submits', async ({ page }) => {
  await page.goto('/rendez-vous.html');
  await page.fill('#nom', 'TEST');
  await page.fill('#prenom', 'User');
  await page.fill('#telephone', '97000000');
  // ... remplir champs obligatoires
  await page.click('button[type="submit"]');
  await expect(page.locator('#confirmation-card')).toBeVisible();
});
```

```bash
# Exécuter
npx playwright install
npx playwright test
```

## Rollback

### Netlify (Instantané)

1. Dashboard Netlify → Deploys
2. Trouvez le déploiement précédent stable
3. Cliquez **"Publish deploy"** → Confirm

### Supabase (Si migration SQL)

```bash
# Si migration cassée
# 1. Restaurer depuis backup Supabase (Dashboard → Backups)
# 2. Ou exécuter script de rollback manuel
psql -h db.xxx.supabase.co -U postgres -d postgres -f rollback.sql
```

### DNS (Si changement domaine)

- TTL bas (300s) 24h avant changement
- Bascule DNS
- Vérifiez propagation : `dig +short zs-pas.sante.gouv.bj`
- Mettez à jour Site URL dans Supabase Auth

## Monitoring Post-Déploiement

### Alertes à Configurer

| Métrique | Seuil | Action |
|----------|-------|--------|
| Uptime | < 99.9% | Alert SMS/Email |
| Erreurs 5xx | > 1% / 5min | Alert Slack |
| Temps de réponse p95 | > 3s | Investiguer |
| Échecs auth | > 10/min | Vérifier Supabase |
| Stockage Supabase | > 80% | Nettoyer/Upgrader |
| Bande passante Netlify | > 80% quota | Optimiser assets |

### Outils Recommandés

- **Uptime** : UptimeRobot (gratuit 50 monitors)
- **APM** : Sentry (gratuit 5k errors/mois) pour erreurs JS
- **Analytics** : Plausible / Matomo (respect vie privée)
- **Logs** : Netlify Functions logs + Supabase Dashboard logs

## Maintenance Programmée

### Quotidien (Automatisé)
- Sauvegarde Supabase (0h00 UTC)
- Nettoyage logs anciens (> 30j)
- Vérification certificats SSL

### Hebdomadaire
- Revue des erreurs Sentry
- Vérification espace disque Supabase
- Test formulaires publics (smoke test)
- Mise à jour dépendances npm (si build step ajouté)

### Mensuel
- Audit sécurité (dépendances, headers)
- Revue performances (Lighthouse)
- Test restauration backup
- Mise à jour docs si changements

### Trimestriel (Aligné sur cahier des charges)
- Audit complet centres de santé (42 fiches)
- Revue contenus publiés
- Formation admins (nouveautés, rappels)
- Réunion comité de pilotage

## Contacts d'Urgence

| Situation | Contact | Délai |
|-----------|---------|-------|
| Site down | Netlify Support + Supabase Support | < 15 min |
| Fuite données | DPO + APDP + MCZ | Immédiat |
| Erreur critique prod | Développeur principal | < 1h |
| Certificat SSL expiré | Netlify (auto) / Let's Encrypt | < 24h |

---

*Document mis à jour : Octobre 2026 | Version 1.0*