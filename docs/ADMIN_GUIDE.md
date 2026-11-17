# Guide Administrateur - Portail ZS-PAS

## Vue d'ensemble

Ce guide explique comment utiliser l'espace d'administration du Portail ZS-PAS pour gérer les contenus, les centres de santé, les rendez-vous et les réclamations.

## Connexion

1. Allez sur `https://votre-domaine.com/admin/connexion.html`
2. Entrez votre email professionnel `@zs-pas.sante.gouv.bj`
3. Entrez votre mot de passe
4. Cliquez sur "Se connecter"
5. **Authentification à deux facteurs (2FA)** : Un code vous sera envoyé par email/SMS

> **Important** : Seuls les comptes créés par un Super Administrateur peuvent accéder à l'admin.

## Rôles et Permissions

| Action | Super Admin | Admin Principal | Validateur | Lecteur |
|--------|-------------|-----------------|------------|---------|
| Gérer utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Gérer centres | ✅ | ✅ | Lecture | Lecture |
| Gérer services | ✅ | ✅ | Lecture | Lecture |
| Valider publications | ✅ | ✅ | ✅ | ❌ |
| Gérer rendez-vous | ✅ | ✅ | Lecture | Lecture |
| Gérer réclamations | ✅ | ✅ | Lecture | Lecture |
| Voir audit logs | ✅ | ✅ | ✅ | ❌ |
| Paramètres site | ✅ | ❌ | ❌ | ❌ |

## Tableau de Bord

### Indicateurs Clés (KPIs)

- **Rendez-vous en attente** : Demandes non traitées
- **Contenus à valider** : Articles/annonces en attente de validation
- **Centres à auditer** : Structures nécessitant une revue trimestrielle
- **Réclamations non lues** : Nouveaux messages usagers
- **Consultations portail** : Statistiques de fréquentation

### Alertes de Gouvernance

Bandeau rouge en haut indiquant les actions urgentes :
- Centres dont la fiche expire bientôt
- Réclamations non traitées depuis > 48h
- Publications en attente depuis > 72h

## Gestion des Centres de Santé

### Ajouter un centre

1. Menu → **Gestion des centres**
2. Cliquez **"Nouveau centre"**
3. Remplissez :
   - **Nom** : Ex: "CSA Djassin"
   - **Type** : CSA, CSC, Maternité, Hôpital Zone, Dispensaire Lacustre, Confessionnel
   - **Commune/Arrondissement** : Sélectionnez
   - **Adresse complète** : Pour la géolocalisation
   - **Téléphone** : Format +229 XX XX XX XX
   - **Email** (optionnel)
   - **Coordonnées GPS** : Latitude/Longitude (optionnel, pour la carte)
   - **Horaires** : Ex: "Lun-Ven 7h-19h"
   - **Code FASS** : Code officiel (ex: BJ-OU-PN-008)
   - **Services** : Cocher les services disponibles
   - **Garde 24h/24** : Si service d'urgence permanent
4. Cliquez **"Enregistrer"**

### Modifier un centre

1. Dans la liste, cliquez l'icône **Modifier** (crayon)
2. Modifiez les champs
3. **Important** : Cochez "Centre actif" pour qu'il soit visible publiquement
4. Enregistrez

### Audit trimestriel (Obligatoire)

Tous les 3 mois, vérifiez :
- [ ] Numéros de téléphone à jour
- [ ] Horaires d'ouverture exacts
- [ ] Services effectivement disponibles
- [ ] Disponibilité médecin de garde
- [ ] Stock médicaments essentiels
- [ ] État infrastructure

Marquez "Audit requis" → "Validé" une fois fait.

## Gestion des Services

Les services apparaissent dans la page "Nos services" et sur les fiches centres.

### Catégories prédéfinies

1. **Santé Maternelle & Infantile** (Vert)
2. **Vaccination & Prévention** (Bleu)
3. **Urgences & Soins Critiques** (Rouge)
4. **Soins de Santé Primaires** (Orange)
5. **Santé Communautaire** (Vert)
6. **Pharmacie & Médicaments** (Bleu)
7. **Laboratoire & Diagnostic** (Orange)
8. **Services Administratifs** (Bleu)

### Ajouter/Modifier

- **Nom** : Clair et compréhensible par le public
- **Description** : 2-3 phrases max
- **Icône** : Nom Material Symbols (ex: `pregnant_woman`, `vaccines`)
- **Public cible** : Ex: "Femmes enceintes", "Enfants <5 ans"
- **Gratuit** : Cochez si entièrement gratuit (programmes nationaux)
- **Ordre** : Numéro d'affichage dans la catégorie

## Workflow de Publication (Actualités/Annonces)

### Cycle de vie

```
BROUILLON
    ↓ (Auteur : "Soumettre pour validation")
SOUMIS POUR VALIDATION
    ↓ (Validateur : "Approuver" ou "Demander modifications")
VALIDÉ / REFUSÉ
    ↓ (Validateur : "Approuver & Publier")
PUBLIÉ
    ↓ (Auteur/Admin : "Archiver" ou "Mettre à jour")
ARCHIVÉ / MIS À JOUR
```

### Rôles

- **Auteur** (Admin Principal) : Crée le brouillon, soumet pour validation
- **Validateur** (Validateur Institutionnel) : Vérifie l'exactitude, approuve ou refuse
- **Super Admin** : Peut tout faire, publication directe possible

### Créer une annonce

1. Menu → **Workflow publications** (ou Gestion actualités)
2. **"Nouvelle annonce"**
3. Remplissez :
   - **Titre** : Court, informatif
   - **Catégorie** : Campagne, Alerte, Info, Planning, Directive
   - **Contenu** : Texte complet
   - **Document joint** (optionnel) : PDF à télécharger
   - **Référence** : Auto-générée (COMM-PAS-YYYY-NNN)
4. **"Enregistrer comme brouillon"** ou **"Soumettre pour validation"**

### Valider une annonce

1. Onglet "À valider" (badge orange)
2. Cliquez **"Approuver & Publier"** (coche verte) ou **"Modifications"** (crayon)
3. Si modifications : ajoutez un commentaire, l'auteur est notifié
4. Une fois publiée : visible sur la page "Actualités" et en page d'accueil (3 dernières)

## Gestion des Documents Publics

### Catégories

- Plans Stratégiques
- Guides Médicaux & Protocoles
- Formulaires & Démarches
- Bulletins Épidémiologiques
- Textes Réglementaires
- Rapports d'Activité

### Publier un document

1. Menu → **Gestion documents**
2. **"Nouveau document"**
3. Titre, catégorie, description
4. **Fichier PDF** : Glissez-déposez (max 10 Mo recommandé)
5. **À la une** : Apparaît en page d'accueil (max 3)
6. Enregistrez → Le téléchargement est tracké (compteur)

## Gestion des Rendez-vous Administratifs

### États

| État | Signification | Action |
|------|---------------|--------|
| Nouvelle demande | Arrivée, non lue | **Confirmer** ou **Reprogrammer** |
| En cours d'instruction | En traitement | Attendre confirmation agenda |
| Confirmé | RDV validé | Usager notifié par SMS |
| À reprogrammer | Conflit agenda | Contacter usager, nouvelle date |
| Refusé | Non faisable | Usager notifié avec motif |
| Annulé | Par usager/admin | Archivé |
| Terminé | Effectué | Archivé auto après 30j |

### Traiter une demande

1. Menu → **Rendez-vous administrés**
2. Filtrez par commune, statut, date
3. Pour chaque demande "Nouvelle" :
   - Vérifiez la faisabilité (agenda MCZ, disponibilité service)
   - **Confirmer** : Choisissez date/heure exacte → SMS auto envoyé
   - **Reprogrammer** : Proposez nouvelle date → Usager contacté
   - **Archiver** : Si doublon, erreur, hors périmètre

### Suivi usager

L'usager peut vérifier son statut sur le portail public avec sa référence (ex: `RDV-PAS-2026-4821`).

## Gestion des Réclamations et Suggestions

### Types

- **Information** : Question sur horaires, services, documents
- **Suggestion** : Proposition d'amélioration
- **Réclamation** : Insatisfaction (accueil, délai, propreté, personnel, médicaments)
- **Partenariat** : Proposition technique/financière/formation
- **Autre**

### Workflow

```
NOUVEAU
    ↓ (Admin : "Traiter")
EN COURS
    ↓ (Admin : Répondre + "Marquer traité")
TRAITÉ
    ↓ (Auto après 30j ou manuel)
ARCHIVÉ
```

### Traiter une réclamation

1. Menu → **Réclamations usagers**
2. Cliquez **"Traiter"** sur une "Nouvelle"
3. Lisez le message
4. Selon le type :
   - **Information** : Répondez directement
   - **Réclamation** : Transmettez au Chef de Centre concerné, suivez
   - **Suggestion** : Remerciez, transmettez au service concerné
   - **Partenariat** : Transmettez au MCZ
5. Cliquez **"Répondre"**, tapez votre réponse
6. L'usager reçoit la réponse par SMS/email

## Journal d'Audit (Traçabilité)

Accessible depuis le Tableau de bord.

### Ce qui est tracé

- Connexions (réussies/échouées, 2FA)
- Créations/Modifications/Suppressions (centres, services, annonces, documents)
- Validations/Refus publications
- Confirmations/Reprogrammations RDV
- Réponses réclamations
- Exports de données
- Changements de rôles utilisateurs

### Export

- Bouton **"Exporter logs CSV"** pour analyse externe
- Filtres par date, utilisateur, action
- IPs masquées (conformité APDP) : `197.234.***.***`

## Bonnes Pratiques

### Sécurité

- ✅ Déconnectez-vous après chaque session
- ✅ Ne partagez jamais vos identifiants
- ✅ Signalez toute activité suspecte
- ✅ Utilisez un gestionnaire de mots de passe
- ✅ Vérifiez l'URL (https://, cadenas) avant de saisir le mot de passe

### Qualité des données

- ✅ Vérifiez les numéros de téléphone avant publication
- ✅ Relisez les annonces avant soumission
- ✅ Mettez à jour les fiches centres chaque trimestre
- ✅ Archivez les anciens documents (ne supprimez pas)
- ✅ Utilisez les références officielles (FASS, COMM-PAS, RDV-PAS)

### RGPD / APDP

- ✅ Aucune donnée médicale dans les formulaires publics
- ✅ Conservation : 12 mois (RDV, contacts), 24 mois (audit)
- ✅ Droit d'accès/rectification/effacement : contactez DPO
- ✅ Export CSV des logs pour contrôle APDP

## Contacts Utiles

| Problème | Contact |
|----------|---------|
| Problème technique | admin@zs-pas.sante.gouv.bj |
| Question Supabase | Supabase Support (dashboard) |
| Problème déploiement | Netlify Support |
| Question APDP | dpo@zs-pas.sante.gouv.bj |
| Urgence serveur | Dr Alphonse KOSSI (MCZ) |

## Raccourcis Clavier (Admin)

| Raccourci | Action |
|-----------|--------|
| `Ctrl + K` | Recherche globale (à implémenter) |
| `Alt + 1` | Tableau de bord |
| `Alt + 2` | Rendez-vous |
| `Alt + 3` | Réclamations |
| `Alt + 4` | Centres |
| `Alt + 5` | Actualités |
| `Alt + 6` | Documents |
| `Escape` | Fermer modal/overlay |

## FAQ Administration

**Q: Un centre a changé de numéro de téléphone.**
R: Modifiez la fiche centre → Enregistrez → La mise à jour est immédiate sur le site public.

**Q: Une annonce contient une erreur après publication.**
R: Allez dans Workflow → Trouvez l'annonce → "Modifier" (crée une nouvelle version brouillon) → Corrigez → Soumettez → Validez.

**Q: Un usager n'a pas reçu son SMS de confirmation RDV.**
R: Vérifiez le numéro dans la fiche RDV → Si correct, cliquez "Renvoyer" (à implémenter via Edge Function) → Sinon appelez l'usager.

**Q: Comment ajouter un nouvel admin ?**
R: Super Admin seulement → Menu utilisateurs (à créer) ou via Supabase Dashboard → Authentication → Add User → Rôle `main_admin` ou `validator`.

**Q: Le compteur de téléchargements ne bouge pas.**
R: C'est normal, il se met à jour via une Edge Function lors du clic "Télécharger". Vérifiez les logs Supabase.

**Q: La carte ne montre pas le nouveau centre.**
R: Vérifiez que Latitude/Longitude sont remplis dans la fiche centre → Videz le cache navigateur (Ctrl+F5).

---

*Guide mis à jour : Octobre 2026 | Version 1.0*