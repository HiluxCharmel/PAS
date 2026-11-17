# Rapport de Tests - Portail ZS-PAS

## Informations Générales

| Élément | Détail |
|---------|--------|
| **Projet** | Portail ZS-PAS - Zone Sanitaire Porto-Novo–Aguégués–Sèmè-Podji |
| **Version testée** | v1.0.0 |
| **Date des tests** | [JJ/MM/AAAA] |
| **Environnement** | [Production / Staging / Développement] |
| **URL testée** | `https://...` |
| **Testeur(s)** | [Nom(s)] |
| **Référence cahier des charges** | v3.0 (Octobre 2026) |

---

## Résumé Exécutif

| Métrique | Résultat |
|----------|----------|
| **Tests exécutés** | [XX] |
| **Tests réussis** | [XX] |
| **Tests échoués** | [XX] |
| **Tests bloqués** | [XX] |
| **Taux de réussite** | [XX]% |
| **Criticité globale** | [Faible / Moyenne / Élevée / Critique] |

**Décision** : [✅ GO / ⚠️ GO AVEC RÉSERVES / ❌ NO-GO]

---

## 1. Tests Fonctionnels (Cahier des Charges §4.2)

### 1.1 Pages Publiques

| ID | Fonctionnalité | Statut | Preuve / Capture | Commentaire |
|----|----------------|--------|------------------|-------------|
| F-01 | Accueil - Hero stats + cartes accès | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-02 | Accueil - Actualités (3 dernières) | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-03 | Accueil - Documents à la une (3) | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-04 | Accueil - Avertissement médical visible | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-05 | Centres - Liste 42+ structures | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-06 | Centres - Filtres commune/arrondissement/type | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-07 | Centres - Recherche textuelle temps réel | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-08 | Centres - Carte Leaflet + marqueurs | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-09 | Centres - Popup marqueur (infos + boutons) | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-10 | Centres - Bouton "Appel direct" (tel:) | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-11 | Centres - Bouton "Itinéraire" (OSM) | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-12 | Centres - Fiche détaillée (services, horaires, FASS) | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-13 | Services - 8 catégories + 23 services | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-14 | Services - Filtres par onglets | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-15 | Services - Badge "Gratuit" visible | ☐ Pass / ☐ Fail / ☐ Block | | |
| F-16 | Rendez-vous - Avertissement médical strict | ☐ Pass / ☐ Fail / ☐ Block | **Obligatoire** |
| F-17 | Rendez-vous - Formulaire 4 blocs complets | ☐ Pass / ☐ Fail / ☐ Block | |
| F-18 | Rendez-vous - Validation champs obligatoires | ☐ Pass / ☐ Fail / ☐ Block | |
| F-19 | Rendez-vous - Date min = lendemain ouvré | ☐ Pass / ☐ Fail / ☐ Block | |
| F-20 | Rendez-vous - Weekends non sélectionnables | ☐ Pass / ☐ Fail / ☐ Block | |
| F-21 | Rendez-vous - Soumission → référence RDV-PAS | ☐ Pass / ☐ Fail / ☐ Block | |
| F-22 | Rendez-vous - Carte confirmation affichée | ☐ Pass / ☐ Fail / ☐ Block | |
| F-23 | Rendez-vous - Suivi par référence fonctionne | ☐ Pass / ☐ Fail / ☐ Block | |
| F-24 | Actualités - 6+ annonces avec catégories | ☐ Pass / ☐ Fail / ☐ Block | |
| F-25 | Actualités - Filtres catégorie + recherche | ☐ Pass / ☐ Fail / ☐ Block | |
| F-26 | Actualités - Téléchargement PDF joint | ☐ Pass / ☐ Fail / ☐ Block | |
| F-27 | Documents - 6 catégories + 8+ docs | ☐ Pass / ☐ Fail / ☐ Block | |
| F-28 | Documents - Téléchargement + compteur | ☐ Pass / ☐ Fail / ☐ Block | |
| F-29 | Contact - 5 types + sujets dynamiques | ☐ Pass / ☐ Fail / ☐ Block | |
| F-30 | Contact - Validation email/tél + compteur | ☐ Pass / ☐ Fail / ☐ Block | |
| F-31 | Contact - FAQ accordéon fonctionnel | ☐ Pass / ☐ Fail / ☐ Block | |
| F-32 | Mentions légales / Confidentialité / Plan site | ☐ Pass / ☐ Fail / ☐ Block | |

### 1.2 Espace Administration

| ID | Fonctionnalité | Statut | Preuve / Capture | Commentaire |
|----|----------------|--------|------------------|-------------|
| A-01 | Connexion email/mot de passe + 2FA | ☐ Pass / ☐ Fail / ☐ Block | **Critique** |
| A-02 | Déconnexion nettoie session | ☐ Pass / ☐ Fail / ☐ Block | |
| A-03 | Tableau de bord - 5 KPIs affichés | ☐ Pass / ☐ Fail / ☐ Block | |
| A-04 | Tableau de bord - Alerte gouvernance | ☐ Pass / ☐ Fail / ☐ Block | |
| A-05 | Centres - CRUD complet (ajout/modif/suppr) | ☐ Pass / ☐ Fail / ☐ Block | |
| A-06 | Centres - Audit trimestriel visible | ☐ Pass / ☐ Fail / ☐ Block | |
| A-07 | Services - CRUD + catégories + ordre | ☐ Pass / ☐ Fail / ☐ Block | |
| A-08 | Actualités - Workflow Brouillon→Validé→Publié | ☐ Pass / ☐ Fail / ☐ Block | **Critique** |
| A-09 | Actualités - Refus avec motif | ☐ Pass / ☐ Fail / ☐ Block | |
| A-10 | Documents - Upload PDF + à la une | ☐ Pass / ☐ Fail / ☐ Block | |
| A-11 | Rendez-vous - Liste paginée + filtres | ☐ Pass / ☐ Fail / ☐ Block | |
| A-12 | Rendez-vous - Confirmer / Reprogrammer / Archiver | ☐ Pass / ☐ Fail / ☐ Block | |
| A-13 | Rendez-vous - SMS confirmation simulé | ☐ Pass / ☐ Fail / ☐ Block | |
| A-14 | Réclamations - Liste + statuts + réponse | ☐ Pass / ☐ Fail / ☐ Block | |
| A-15 | Audit Logs - Lisible + Export CSV | ☐ Pass / ☐ Fail / ☐ Block | |
| A-16 | Rôles - Super Admin / Admin / Validateur / Lecteur | ☐ Pass / ☐ Fail / ☐ Block | |
| A-17 | Permissions - Interface selon rôle | ☐ Pass / ☐ Fail / ☐ Block | |

---

## 2. Tests Non-Fonctionnels

### 2.1 Sécurité (Cahier des Charges §11)

| ID | Test | Statut | Détail |
|----|------|--------|--------|
| S-01 | HTTPS forcé (HSTS) | ☐ Pass / ☐ Fail | |
| S-02 | Headers sécurité (CSP, X-Frame, etc.) | ☐ Pass / ☐ Fail | |
| S-03 | RLS activée sur **toutes** tables | ☐ Pass / ☐ Fail | **Critique** |
| S-04 | Politiques RLS testées par rôle | ☐ Pass / ☐ Fail | **Critique** |
| S-05 | `service_role` absent du frontend | ☐ Pass / ☐ Fail | **Critique** |
| S-06 | Validation côté serveur (Edge Functions) | ☐ Pass / ☐ Fail | |
| S-07 | Protection XSS (sanitization) | ☐ Pass / ☐ Fail | |
| S-08 | Protection CSRF (SameSite cookies) | ☐ Pass / ☐ Fail | |
| S-09 | Rate limiting formulaires publics | ☐ Pass / ☐ Fail | |
| S-10 | Authentification forte admin (2FA) | ☐ Pass / ☐ Fail | **Critique** |
| S-11 | Journal d'audit immuable | ☐ Pass / ☐ Fail | |
| S-12 | Sauvegardes automatiques configurées | ☐ Pass / ☐ Fail | |
| S-13 | Pas de données médicales dans formulaires | ☐ Pass / ☐ Fail | **Critique** |
| S-14 | Avertissement médical sur pages concernées | ☐ Pass / ☐ Fail | **Critique** |

### 2.2 Performance (Cible < 3s)

| ID | Test | Résultat | Cible | Statut |
|----|------|----------|-------|--------|
| P-01 | Page d'accueil (LCP) | [X.XX]s | < 2.5s | ☐ Pass / ☐ Fail |
| P-02 | Page Centres (LCP) | [X.XX]s | < 3s | ☐ Pass / ☐ Fail |
| P-03 | Carte Leaflet (chargement) | [X.XX]s | < 3s | ☐ Pass / ☐ Fail |
| P-04 | Formulaire Rendez-vous (TTI) | [X.XX]s | < 2s | ☐ Pass / ☐ Fail |
| P-05 | Admin Dashboard (FCP) | [X.XX]s | < 2s | ☐ Pass / ☐ Fail |
| P-06 | Taille JS totale (gzippé) | [XXX] KB | < 150 KB | ☐ Pass / ☐ Fail |
| P-07 | Taille CSS totale (gzippé) | [XX] KB | < 50 KB | ☐ Pass / ☐ Fail |
| P-08 | Requêtes HTTP (page d'accueil) | [XX] | < 30 | ☐ Pass / ☐ Fail |
| P-09 | Cache headers assets statiques | Configuré | 1 an | ☐ Pass / ☐ Fail |
| P-10 | Compression Brotli/Gzip | Activée | Oui | ☐ Pass / ☐ Fail |

*Outils : Lighthouse CI, WebPageTest, Chrome DevTools Performance*

### 2.3 Accessibilité (WCAG 2.1 AA)

| ID | Critère | Statut | Détail |
|----|---------|--------|--------|
| AC-01 | Contraste texte ≥ 4.5:1 (7:1 AAA corps) | ☐ Pass / ☐ Fail | |
| AC-02 | Contraste UI ≥ 3:1 | ☐ Pass / ☐ Fail | |
| AC-03 | Navigation clavier complète (Tab/Enter/Esc) | ☐ Pass / ☐ Fail | |
| AC-04 | Focus visible clair (outline) | ☐ Pass / ☐ Fail | |
| AC-05 | Labels sur tous inputs (explicites) | ☐ Pass / ☐ Fail | |
| AC-06 | Alt text sur toutes images informatives | ☐ Pass / ☐ Fail | |
| AC-07 | Structure heading hiérarchique (h1→h6) | ☐ Pass / ☐ Fail | |
| AC-08 | ARIA labels/roles là où nécessaire | ☐ Pass / ☐ Fail | |
| AC-09 | Skip link présent (aller au contenu) | ☐ Pass / ☐ Fail | |
| AC-10 | Formulaires : erreurs annoncées (aria-live) | ☐ Pass / ☐ Fail | |
| AC-11 | Modaux : focus trap + restore | ☐ Pass / ☐ Fail | |
| AC-12 | Langue de page `lang="fr"` | ☐ Pass / ☐ Fail | |

*Outils : axe-core, WAVE, Lighthouse Accessibility, test manuel NVDA/VoiceOver*

### 2.4 Responsive / Mobile-First (Cahier des Charges §64-66)

| ID | Viewport | Test | Statut |
|----|----------|------|--------|
| R-01 | 375px (Mobile Android entrée) | Tout lisible, boutons ≥ 48px | ☐ Pass / ☐ Fail |
| R-02 | 375px | Menu hamburger fonctionnel | ☐ Pass / ☐ Fail |
| R-03 | 375px | Cartes centres en colonne unique | ☐ Pass / ☐ Fail |
| R-04 | 375px | Formulaires empilés (1 colonne) | ☐ Pass / ☐ Fail |
| R-05 | 375px | Carte Leaflet 400px hauteur | ☐ Pass / ☐ Fail |
| R-06 | 375px | Admin sidebar en overlay | ☐ Pass / ☐ Fail |
| R-07 | 768px (Tablette) | Grille 2 colonnes | ☐ Pass / ☐ Fail |
| R-08 | 768px | Navigation desktop visible | ☐ Pass / ☐ Fail |
| R-09 | 1024px (Desktop) | Grille 3-4 colonnes | ☐ Pass / ☐ Fail |
| R-10 | 1024px | Sidebar admin fixe visible | ☐ Pass / ☐ Fail |
| R-11 | 1280px (Max width) | Contenu centré, max 1280px | ☐ Pass / ☐ Fail |
| R-12 | Orientation landscape mobile | Pas de débordement horizontal | ☐ Pass / ☐ Fail |

*Test sur device réel Android (ex: Samsung A10, Tecno Spark) + Chrome DevTools Device Toolbar*

### 2.5 Compatibilité Navigateurs

| Navigateur | Version | Statut |
|------------|---------|--------|
| Chrome | 118+ | ☐ Pass / ☐ Fail |
| Firefox | 119+ | ☐ Pass / ☐ Fail |
| Safari | 16+ (iOS/macOS) | ☐ Pass / ☐ Fail |
| Edge | 118+ | ☐ Pass / ☐ Fail |
| Samsung Internet | 20+ | ☐ Pass / ☐ Fail |
| Chrome Android | 118+ | ☐ Pass / ☐ Fail |

---

## 3. Tests de Données et Intégrité

| ID | Test | Statut | Résultat |
|----|------|--------|----------|
| D-01 | 42 centres de santé en base | ☐ Pass / ☐ Fail | [XX] trouvés |
| D-02 | 23 services référencés | ☐ Pass / ☐ Fail | [XX] trouvés |
| D-03 | Codes FASS uniques par centre | ☐ Pass / ☐ Fail | |
| D-04 | Références RDV uniques (RDV-PAS-YYYY-NNNN) | ☐ Pass / ☐ Fail | |
| D-05 | Références annonces uniques (COMM-PAS-YYYY-NNN) | ☐ Pass / ☐ Fail | |
| D-06 | Données vérifiées < 3 mois (champ verified_at) | ☐ Pass / ☐ Fail | |
| D-07 | Pas de données médicales en base | ☐ Pass / ☐ Fail | **Critique** |
| D-08 | Intégrité référentielle (FK) | ☐ Pass / ☐ Fail | |
| D-09 | Index sur colonnes filtrées | ☐ Pass / ☐ Fail | |

---

## 4. Tests de Régression (Si applicable)

| Version précédente | Zone testée | Statut | Notes |
|-------------------|-------------|--------|-------|
| v0.9 → v1.0 | [Module] | ☐ Pass / ☐ Fail | |

---

## 5. Anomalies Identifiées

### Critiques (Bloquantes pour production)

| ID | Titre | Description | Steps to Reproduce | Impact | Contournement |
|----|-------|-------------|-------------------|--------|---------------|
| CRIT-01 | | | | | |
| CRIT-02 | | | | | |

### Majeures (À corriger avant production)

| ID | Titre | Description | Steps to Reproduce | Impact | Contournement |
|----|-------|-------------|-------------------|--------|---------------|
| MAJ-01 | | | | | |
| MAJ-02 | | | | | |

### Mineures (Peuvent passer en production avec suivi)

| ID | Titre | Description | Steps to Reproduce | Impact | Contournement |
|----|-------|-------------|-------------------|--------|---------------|
| MIN-01 | | | | | |
| MIN-02 | | | | | |

### Cosmétiques / Améliorations

| ID | Titre | Description | Priorité |
|----|-------|-------------|----------|
| COS-01 | | | Basse |
| COS-02 | | | Basse |

---

## 6. Couverture de Tests

| Module | Tests Planifiés | Tests Exécutés | Couverture |
|--------|-----------------|----------------|------------|
| Pages Publiques | [XX] | [XX] | [XX]% |
| Administration | [XX] | [XX] | [XX]% |
| Sécurité | [XX] | [XX] | [XX]% |
| Performance | [XX] | [XX] | [XX]% |
| Accessibilité | [XX] | [XX] | [XX]% |
| Responsive | [XX] | [XX] | [XX]% |
| **TOTAL** | **[XX]** | **[XX]** | **[XX]%** |

---

## 7. Métriques de Qualité

| Métrique | Valeur | Seuil | Statut |
|----------|--------|-------|--------|
| Densité de défauts (défauts/KLOC) | [X.XX] | < 1.0 | ☐ Pass / ☐ Fail |
| Taux de fuite en production | [X]% | 0% | ☐ Pass / ☐ Fail |
| Temps moyen correction critique | [X]h | < 4h | ☐ Pass / ☐ Fail |
| Tests automatisés (si existants) | [XX]% | > 80% | ☐ Pass / ☐ Fail |

---

## 8. Recommandations

### Court terme (Avant mise en production)
1. [Action prioritaire 1]
2. [Action prioritaire 2]
3. [Action prioritaire 3]

### Moyen terme (Premier mois)
1. [Amélioration 1]
2. [Amélioration 2]

### Long terme (Prochaine version)
1. [Évolution 1]
2. [Évolution 2]

---

## 9. Approbation

| Rôle | Nom | Signature | Date | Décision |
|------|-----|-----------|------|----------|
| **Chef de Projet** | | | | ☐ Approuvé / ☐ Rejeté |
| **MCZ (Dr KOSSI)** | | | | ☐ Approuvé / ☐ Rejeté |
| **Validateur Institutionnel** | | | | ☐ Approuvé / ☐ Rejeté |
| **DPO** | | | | ☐ Approuvé / ☐ Rejeté |
| **Équipe Technique** | | | | ☐ Approuvé / ☐ Rejeté |

---

## 9. Annexes

- **Annexe A** : Captures d'écran anomalies critiques
- **Annexe B** : Rapports Lighthouse / WebPageTest
- **Annexe C** : Résultats axe-core / WAVE
- **Annexe D** : Logs tests manuels (device réel)
- **Annexe E** : Script de test DR (si exécuté)

---

*Rapport généré le [JJ/MM/AAAA] | Version 1.0 | Conforme Cahier des Charges v3.0*