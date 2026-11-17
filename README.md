# Portail ZS-PAS - Zone Sanitaire Porto-Novo–Aguégués–Sèmè-Podji

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)

Portail web officiel de la Zone Sanitaire PAS (Porto-Novo – Aguégués – Sèmè-Podji), département de l'Ouémé, République du Bénin.

## 🎯 Objectif

Mettre en place une plateforme numérique fiable, sécurisée, mobile-first et facile à maintenir pour améliorer l'accès de la population aux informations validées de la Zone sanitaire PAS.

## ✨ Fonctionnalités Principales

### 🌐 Pages Publiques
- **Accueil** : Hero institutionnel, recherche rapide centres, cartes d'accès, stats clés, éditorial MCZ, actualités, documents, avertissement urgence
- **Annuaire Centres de Santé** : 42 structures certifiées, filtres (commune, arrondissement, type, services), carte interactive Leaflet/OpenStreetMap, fiches détaillées, boutons appel/itinéraire
- **Services de Santé** : 8 catégories, 23 services, badges gratuité, public cible, recherche
- **Rendez-vous Administratif** : Formulaire 4 étapes (identité, détails, disponibilités, consentement), validation côté client, référence unique `RDV-PAS-YYYY-NNNN`, suivi par référence, **aucune donnée médicale**
- **Actualités & Annonces** : Workflow validation (Brouillon → Soumis → Validé → Publié), catégories, documents joints, recherche
- **Documents Publics** : 6 catégories, téléchargement PDF, compteur, documents à la une
- **Contact & Réclamations** : 5 types, sujets dynamiques, FAQ accordéon, engagement réponse 48h
- **Pages Légales** : Mentions légales, Politique de confidentialité (APDP), Plan du site

### 🔐 Espace Administration (Rôles RBAC)
| Rôle | Permissions |
|------|-------------|
| **Super Admin** | Accès complet, gestion utilisateurs, paramètres |
| **Admin Principal** | Gestion centres, services, actualités, documents, RDV, réclamations |
| **Validateur Institutionnel** | Validation publications, lecture centres/services/RDV/réclamations |
| **Lecteur** | Consultation seule |

**Modules Admin** :
- Tableau de bord avec KPIs temps réel + alertes gouvernance
- Gestion centres (CRUD, audit trimestriel, carte)
- Gestion services (catégories, ordre, gratuité)
- Workflow publications (Brouillon → Validation → Publication)
- Gestion documents (upload PDF, à la une, compteur téléchargements)
- File RDV (confirmation, reprogrammation, archivage, SMS simulé)
- Registre réclamations (traitement, réponse, médiation)
- Journal d'audit complet (export CSV, IP masquées APDP)

## 🛡️ Sécurité & Conformité

- **Row Level Security (RLS)** sur **toutes** les tables Supabase
- Politiques testées par rôle (anon, authenticated, admin, validator, reader)
- Clé `service_role` **uniquement** dans Edge Functions serveur
- HTTPS forcé, HSTS, CSP strict, headers sécurité
- Authentification 2FA obligatoire admin
- Journal d'audit immuable (traçabilité APDP)
- **Zéro donnée médicale** dans formulaires publics
- Avertissements médicaux obligatoires conformes OMS/APDP
- Conservation données : 12 mois (RDV/contacts), 24 mois (audit)
- DPO désigné, procédure exercice droits RGPD/APDP

## 📱 Mobile-First & Accessibilité

- **Mobile-first réel** : testé sur Android entrée de gamme (375px, 3G)
- Cibles tactiles ≥ 48×48px
- Menu hamburger, sidebar admin overlay
- Contraste WCAG AAA (7:1) texte, AA (4.5:1) UI
- Navigation clavier complète, skip link, focus visible
- ARIA labels, structure heading hiérarchique
- Langue `fr`, police système lisible (Inter + Plus Jakarta Sans)

## 🏗️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | HTML5, CSS3 (Design System custom), JavaScript ES Modules |
| **Styling** | Design System ZS-PAS (Tailwind-like utilities, CSS Variables) |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime) |
| **Carte** | OpenStreetMap + Leaflet 1.9.4 |
| **Hébergement** | Netlify (CDN global, Edge Functions, SSL auto) |
| **CI/CD** | Netlify Git-deploy (push main = prod) |
| **Monitoring** | Supabase Logs, Netlify Analytics, Sentry (optionnel) |

## 📁 Structure du Projet

```
portail-zs-pas/
├── index.html                    # Accueil
├── centres.html                  # Annuaire + Carte
├── services.html                 # Services de santé
├── rendez-vous.html              # Demande RDV administratif
├── actualites.html               # Actualités & Annonces
├── documents.html                # Documents publics
├── contact.html                  # Contact & Réclamations
├── mentions-legales.html         # Mentions légales
├── politique-confidentialite.html # Politique confidentialité (APDP)
├── plan-du-site.html             # Plan du site
├── admin/
│   ├── connexion.html            # Login + 2FA
│   ├── tableau-de-bord.html      # Dashboard KPIs + alertes
│   ├── centres.html              # Gestion centres
│   ├── services.html             # Gestion services
│   ├── actualites.html           # Workflow publications
│   ├── documents.html            # Gestion documents
│   ├── rendez-vous.html          # File RDV
│   └── contacts.html             # Réclamations usagers
├── css/
│   ├── style.css                 # Styles principaux + design system
│   ├── responsive.css            # Mobile-first utilities
│   └── admin.css                 # Styles admin dashboard
├── js/
│   ├── main.js                   # Entry point + routing pages
│   ├── components.js             # Header, Footer, Toast, Modal, Utils
│   ├── supabase-config.js        # Config Supabase + constantes
│   ├── auth.js                   # Authentification + RBAC
│   ├── centres.js                # Annuaire + Carte Leaflet
│   ├── services.js               # Services catégories
│   ├── actualites.js             # Actualités + workflow
│   ├── documents.js              # Documents publics
│   ├── rendez-vous.js            # Formulaire RDV + suivi
│   ├── contact.js                # Contact + FAQ
│   └── admin.js                  # Dashboard + CRUD admin
├── sql/
│   └── schema.sql                # Schéma complet + RLS + données initiales
├── assets/
│   ├── logo-zs-pas.svg           # Logo officiel
│   └── favicon.svg               # Favicon
└── docs/
    ├── INSTALLATION.md           # Guide installation complet
    ├── ADMIN_GUIDE.md            # Guide administrateur
    ├── DEPLOYMENT.md             # Guide déploiement Netlify/Supabase
    ├── BACKUP_RESTORE.md         # Procédures sauvegarde/restauration
    └── TEST_REPORT_TEMPLATE.md   # Modèle rapport de tests
```

## 🚀 Démarrage Rapide

### Prérequis
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Netlify](https://netlify.com) (gratuit)
- Git

### 1. Configuration Supabase
```bash
# Créer projet sur supabase.com
# SQL Editor → Exécuter sql/schema.sql
# Authentication → Settings → Site URL + Redirect URLs
# Storage → Créer 3 buckets (public-documents, facility-images, user-avatars)
# Noter : Project URL + anon key
```

### 2. Configuration Frontend
```bash
# Modifier js/supabase-config.js
export const SUPABASE_CONFIG = {
  url: 'VOTRE_PROJECT_URL',
  anonKey: 'VOTRE_ANON_KEY'
};
```

### 3. Déploiement Netlify
```bash
# Option A: Git (recommandé)
# Push sur GitHub → Netlify "Import from Git"
# Build command: (vide) | Publish directory: portail-zs-pas
# Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# Option B: CLI
npm install -g netlify-cli
cd portail-zs-pas
netlify deploy --prod --dir=.
```

### 4. Premiers Utilisateurs
```sql
-- Via Supabase Dashboard > Authentication > Add User
-- Super Admin: admin@zs-pas.sante.gouv.bj (role: super_admin)
-- Validateur: validateur@zs-pas.sante.gouv.bj (role: validator)
-- Agent: agent@zs-pas.sante.gouv.bj (role: main_admin)
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [INSTALLATION.md](docs/INSTALLATION.md) | Installation complète (Supabase, Netlify, DNS, Edge Functions) |
| [ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | Guide utilisation espace admin (rôles, workflows, bonnes pratiques) |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Déploiement production, CI/CD, checklist pré-prod, rollback |
| [BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md) | Sauvegardes (3-2-1), restauration PITR, disaster recovery, tests DR |
| [TEST_REPORT_TEMPLATE.md](docs/TEST_REPORT_TEMPLATE.md) | Modèle rapport de tests (fonctionnel, sécurité, perf, accessibilité) |

## ✅ Critères d'Acceptation (Cahier des Charges §15)

- [x] Pages publiques fonctionnelles
- [x] Annuaire centres opérationnel (recherche, carte, fiches)
- [x] Données validées par Bureau de Zone
- [x] Workflow validation contenus fonctionnel
- [x] Formulaire rendez-vous simple fonctionnel
- [x] Espace admin avec rôles opérationnel
- [x] RLS activée et testée sur toutes tables
- [x] Aucune clé secrète exposée
- [x] Politique confidentialité publiée
- [x] Mobile Android entrée de gamme fonctionnel
- [x] 2 admins formés (Super Admin + Validateur)
- [x] Sauvegardes configurées

## 🔧 Scripts Utiles

```bash
# Développement local (Python)
cd portail-zs-pas && python -m http.server 3000

# Développement local (Node.js)
npx serve .

# Netlify Dev (test Edge Functions)
netlify dev

# Lighthouse CI (performance)
npx lhci autorun

# Tests accessibilité
npx @axe-core/cli https://localhost:3000

# Playwright E2E (si configuré)
npx playwright test
```

## 🤝 Contribution

1. Fork le projet
2. Créer branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'feat: description'`)
4. Push (`git push origin feature/amelioration`)
5. Ouvrir Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir `LICENSE` pour plus de détails.

> **Note** : Ce portail est la propriété de la République du Bénin - Ministère de la Santé. L'utilisation du code source pour d'autres zones sanitaires nécessite l'autorisation du Ministère.

## 📞 Contacts

| Rôle | Contact |
|------|---------|
| **MCZ (Médecin Coordonnateur)** | Dr Alphonse KOSSI - +229 20 21 23 45 |
| **Développement Technique** | Équipe technique ZS-PAS |
| **DPO (Protection Données)** | dpo@zs-pas.sante.gouv.bj |
| **Support Supabase** | Dashboard → Help → Support |
| **Support Netlify** | Dashboard → Help → Contact Support |

## 🚨 Numéros d'Urgence (Intégrés au Portail)

| Service | Numéro | Disponibilité |
|---------|--------|---------------|
| **SAMU Urgences** | **112** | 24h/24, 7j/7 |
| **Ligne Verte Santé** | **136** | 24h/24, 7j/7 |

---

**Portail ZS-PAS v1.0** — *Développé pour la Zone Sanitaire Porto-Novo–Aguégués–Sèmè-Podji, Département de l'Ouémé, République du Bénin — Octobre 2026*