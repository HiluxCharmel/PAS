# Procédures de Sauvegarde et Restauration - Portail ZS-PAS

## Vue d'ensemble

Ce document décrit les procédures de sauvegarde, de restauration et de reprise d'activité (DRP) pour le Portail ZS-PAS.

## Architecture de Sauvegarde

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATÉGIE 3-2-1                              │
├─────────────────────────────────────────────────────────────────┤
│  3 copies des données                                           │
│  2 supports de stockage différents                              │
│  1 copie hors site (off-site)                                   │
└─────────────────────────────────────────────────────────────────┘

Supabase (Principal)          Netlify (Frontend)          Hors-site (Manuel)
├── Base PostgreSQL           ├── Build artifacts           ├── Export SQL mensuel
├── Storage (fichiers)        ├── Config DNS                ├── Backup configs
├── Auth users                ├── Variables env             └── Documentation
└── Logs audit                └── Deploy history
```

## Sauvegardes Automatiques (Supabase)

### Configuration

Supabase gère automatiquement :
- **Sauvegarde quotidienne** : 00:00 UTC (rétention 7 jours plan gratuit, 30+ jours plan Pro)
- **Point-in-time Recovery (PITR)** : Récupération à la seconde près (plan Pro)
- **Réplication** : Multi-AZ dans la région choisie

### Vérification

```bash
# Via Supabase CLI
supabase backups list --project-ref YOUR_REF

# Via Dashboard
# Settings → Database → Backups
```

### Rétention Recommandée

| Plan | Quotidienne | Hebdomadaire | Mensuelle | Annuelle |
|------|-------------|--------------|-----------|----------|
| Gratuit | 7 jours | ❌ | ❌ | ❌ |
| Pro | 30 jours | 12 semaines | 12 mois | ❌ |
| Enterprise | 90 jours | 52 semaines | 36 mois | 7 ans |

> **Recommandation** : Passer au plan Pro (25$/mois) pour PITR et rétention 30 jours.

## Sauvegardes Manuelles (Mensuelles)

### Export Complet Base de Données

```bash
#!/bin/bash
# backup_monthly.sh - Exécuter le 1er de chaque mois via cron

DATE=$(date +%Y%m%d)
PROJECT_REF="votre-project-ref"
OUTPUT_DIR="/backups/zs-pas/$DATE"

mkdir -p $OUTPUT_DIR

# 1. Dump structure + data (sans auth.users géré par Supabase)
pg_dump -h db.$PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --exclude-table=auth.* \
  --exclude-table=storage.* \
  --exclude-table=realtime.* \
  --no-owner \
  --no-privileges \
  > $OUTPUT_DIR/zs-pas-data-$DATE.sql

# 2. Dump rôles et permissions
pg_dump -h db.$PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  --table=profiles \
  --table=health_facilities \
  --table=services \
  --table=facility_services \
  --table=announcements \
  --table=documents \
  --table=appointments \
  --table=contact_requests \
  --table=audit_logs \
  --table=site_settings \
  > $OUTPUT_DIR/zs-pas-schema-$DATE.sql

# 3. Compresser
tar -czf $OUTPUT_DIR/zs-pas-full-$DATE.tar.gz -C $OUTPUT_DIR .

# 4. Upload vers stockage hors-site (ex: AWS S3, Wasabi, Backblaze B2)
# aws s3 cp $OUTPUT_DIR/zs-pas-full-$DATE.tar.gz s3://zs-pas-backups/monthly/

# 5. Nettoyage local > 90 jours
find /backups/zs-pas -type f -mtime +90 -delete

echo "Backup completed: $OUTPUT_DIR/zs-pas-full-$DATE.tar.gz"
```

### Export Fichiers Storage

```bash
#!/bin/bash
# backup_storage.sh

DATE=$(date +%Y%m%d)
BUCKETS=("public-documents" "facility-images" "user-avatars")

for BUCKET in "${BUCKETS[@]}"; do
  # Via Supabase CLI (nécessite service_role)
  supabase storage download --bucket $BUCKET --pattern "**" --save-dir /backups/storage/$DATE/$BUCKET
done

tar -czf /backups/storage/zs-pas-storage-$DATE.tar.gz -C /backups/storage/$DATE .
```

### Export Configuration

```bash
#!/bin/bash
# backup_config.sh - Configuration Netlify + Supabase

DATE=$(date +%Y%m%d)
CONFIG_DIR="/backups/config/$DATE"

mkdir -p $CONFIG_DIR

# 1. Variables d'environnement Netlify (via API)
curl -H "Authorization: Bearer $NETLIFY_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/env" \
  > $CONFIG_DIR/netlify-env-$DATE.json

# 2. Config Supabase (RLS, functions, etc.)
supabase db dump --schema=public --data-only=false > $CONFIG_DIR/supabase-config-$DATE.sql

# 3. DNS records
dig +short zs-pas.sante.gouv.bj A > $CONFIG_DIR/dns-$DATE.txt
dig +short zs-pas.sante.gouv.bj CNAME >> $CONFIG_DIR/dns-$DATE.txt

# 4. Certificats SSL (Let's Encrypt via Netlify - auto)
# Netlify gère automatiquement, pas de backup nécessaire
```

## Procédures de Restauration

### Scénario 1 : Restauration Ponctuelle (PITR) - Plan Pro requis

**Cas** : Suppression accidentelle de données, corruption mineure

```bash
# Via Supabase Dashboard
# Settings → Database → Backups → "Restore to point in time"
# Choisir date/heure → Confirmer

# Ou via CLI
supabase restore --project-ref YOUR_REF --recovery-time "2026-10-15 14:30:00+00"
```

**Délai** : 10-30 minutes selon taille DB
**Impact** : Base verrouillée pendant restauration

### Scénario 2 : Restauration depuis Backup Quotidien

**Cas** : PITR non disponible (plan gratuit) ou corruption plus ancienne

```bash
# 1. Télécharger le backup depuis Supabase Dashboard
# Settings → Database → Backups → Download (fichier .dump ou .sql)

# 2. Restaurer sur nouvelle DB (recommandé) ou existante
# Sur nouvelle instance Supabase :
createdb -h db.NEW_REF.supabase.co -U postgres zs_pas_restore
pg_restore -h db.NEW_REF.supabase.co -U postgres -d zs_pas_restore backup.dump

# Ou si .sql :
psql -h db.NEW_REF.supabase.co -U postgres -d zs_pas_restore < backup.sql

# 3. Vérifier l'intégrité
psql -h db.NEW_REF.supabase.co -U postgres -d zs_pas_restore -c "
  SELECT count(*) FROM health_facilities;
  SELECT count(*) FROM appointments WHERE status='nouvelle_demande';
  SELECT count(*) FROM announcements WHERE status='publie';
"

# 4. Basculer DNS vers nouvelle instance (ou renommer projet)
```

### Scénario 3 : Restauration Complète (Disaster Recovery)

**Cas** : Perte totale compte Supabase, piratage, suppression projet

#### Prérequis
- Backup mensuel complet (SQL + Storage + Config)
- Accès Netlify + DNS
- Nouveau projet Supabase créé

#### Procédure

```bash
#!/bin/bash
# disaster_recovery.sh

NEW_PROJECT_REF="nouveau-projet-ref"
BACKUP_DATE="20261001"  # Date du backup à restaurer
BACKUP_DIR="/backups/zs-pas/$BACKUP_DATE"

echo "=== DISASTER RECOVERY ZS-PAS ==="
echo "Nouveau projet: $NEW_PROJECT_REF"
echo "Backup source: $BACKUP_DIR"

# 1. Créer nouveau projet Supabase (via Dashboard ou CLI)
# supabase projects create zs-pas-restored --region eu-west-1
# Noter le NEW_PROJECT_REF et mot de passe DB

# 2. Attendre que le projet soit prêt (5-10 min)
echo "Attente projet prêt..."
sleep 300

# 3. Restaurer schéma + données
echo "Restauration base de données..."
psql -h db.$NEW_PROJECT_REF.supabase.co -U postgres -d postgres < $BACKUP_DIR/zs-pas-schema-$BACKUP_DATE.sql
psql -h db.$NEW_PROJECT_REF.supabase.co -U postgres -d postgres < $BACKUP_DIR/zs-pas-data-$BACKUP_DATE.sql

# 4. Recréer les buckets Storage
supabase storage create-bucket public-documents --public --project-ref $NEW_PROJECT_REF
supabase storage create-bucket facility-images --public --project-ref $NEW_PROJECT_REF
supabase storage create-bucket user-avatars --project-ref $NEW_PROJECT_REF

# 5. Restaurer fichiers Storage
for BUCKET in public-documents facility-images user-avatars; do
  supabase storage upload --bucket $BUCKET --source /backups/storage/$BACKUP_DATE/$BUCKET/** --project-ref $NEW_PROJECT_REF
done

# 6. Reconfigurer Auth
# - Désactiver signup public
# - Configurer providers OAuth si utilisés
# - Recréer utilisateurs admins (via SQL ou Dashboard)

# 7. Déployer Edge Functions
supabase functions deploy --project-ref $NEW_PROJECT_REF

# 8. Mettre à jour Netlify
# Site Settings → Environment Variables → Update VITE_SUPABASE_URL et ANON_KEY
# Trigger new deploy

# 9. Mettre à jour DNS si projet ref changé
# CNAME zs-pas.sante.gouv.bj → nouveau-projet.netlify.app

# 10. Tests de validation
echo "Tests post-restauration..."
curl -s https://zs-pas.sante.gouv.bj | grep -q "Zone Sanitaire" && echo "✓ Frontend OK"
curl -s https://$NEW_PROJECT_REF.supabase.co/rest/v1/health_facilities?select=count | jq . && echo "✓ API OK"

echo "=== RESTAURATION TERMINÉE ==="
```

### Scénario 4 : Restauration Fichiers Uniquement

**Cas** : Suppression accidentelle documents/images

```bash
# Via Supabase Dashboard → Storage → Parcourir → Corbeille (si activé)
# Ou re-upload depuis backup mensuel Storage

supabase storage upload --bucket public-documents --source /backups/storage/20261001/public-documents/document.pdf
```

## Validation Post-Restauration

### Checklist Obligatoire

```markdown
## Validation Post-Restauration - Date: _________ Sign: _________

### Base de Données
- [ ] Tables principales accessibles (health_facilities, appointments, etc.)
- [ ] Compteurs cohérents (nb centres, nb RDV en attente, nb annonces publiées)
- [ ] RLS active sur toutes tables (`SELECT * FROM pg_policies;`)
- [ ] Triggers `updated_at` fonctionnels (test UPDATE)
- [ ] Fonctions `generate_appointment_reference()` testées
- [ ] Index présents (`\d+ health_facilities`)

### Authentification
- [ ] Connexion admin existante fonctionne
- [ ] 2FA opérationnel
- [ ] Rôles utilisateurs corrects (super_admin, main_admin, validator, reader)
- [ ] Signup public désactivé

### Storage
- [ ] 3 buckets présents (public-documents, facility-images, user-avatars)
- [ ] Policies lecture/écriture correctes
- [ ] Documents clés accessibles (PDS, calendrier vaccinal, formulaires)
- [ ] Images centres affichées sur cartes

### Edge Functions
- [ ] send-email déployée et testée
- [ ] send-sms déployée et testée
- [ ] generate-pdf déployée
- [ ] Logs sans erreur

### Frontend (Netlify)
- [ ] Variables d'env mises à jour (SUPABASE_URL, ANON_KEY)
- [ ] Nouveau déploiement déclenché et réussi
- [ ] Site accessible sur domaine production
- [ ] HTTPS valide (certificat Let's Encrypt)
- [ ] Headers sécurité présents
- [ ] CSP ne bloque pas ressources légitimes

### Fonctionnel
- [ ] Page d'accueil charge komplett
- [ ] Centres : liste + carte + filtres + recherche
- [ ] Rendez-vous : formulaire + confirmation + suivi
- [ ] Contact : formulaire + FAQ
- [ ] Admin : login + tableau de bord + CRUD centres + workflow annonces
- [ ] Audit logs lisibles

### DNS / SSL
- [ ] Domaine principal résout vers Netlify
- [ ] www redirige vers non-www (ou inversement)
- [ ] Certificat SSL valide > 30 jours
- [ ] HSTS activé

### Conformité
- [ ] Politique confidentialité accessible
- [ ] Mentions légales accessibles
- [ ] Avertissement médical présent
- [ ] Contact DPO visible
```

## Tests de Reprise d'Activité (DR Test)

### Fréquence : Trimestrielle

### Procédure

1. **Annonce** : Informer l'équipe 1 semaine avant
2. **Environnement test** : Créer projet Supabase `zs-pas-dr-test`
3. **Exécution** : Lancer `disaster_recovery.sh` vers projet test
4. **Validation** : Checklist complète par 2 personnes
5. **Documentation** : Noter durée, problèmes, améliorations
6. **Nettoyage** : Supprimer projet test
7. **Rapport** : Partager au comité de pilotage

### Métriques Cibles

| Métrique | Objectif | Critique |
|----------|----------|----------|
| RTO (Recovery Time Objective) | < 4 heures | ✅ |
| RPO (Recovery Point Objective) | < 24 heures | ✅ |
| Durée test DR | < 2 heures | |
| Taux de succès tests | 100% | ✅ |

## Contacts et Escalade

| Niveau | Contact | Déclencheur | Délai |
|--------|---------|-------------|-------|
| 1 - Opérationnel | Admin ZS-PAS | Incident minear | < 1h |
| 2 - Technique | Développeur / Supabase Support | Panne partielle | < 4h |
| 3 - Critique | MCZ + DPO + Développeur | Panne totale / Fuite données | Immédiat |
| 4 - Institutionnel | Ministère Santé / APDP | Fuite données médicales | Immédiat (légal) |

### Numéros d'Urgence

- **Supabase Support** : Dashboard → Help → Support (plan Pro+)
- **Netlify Support** : Dashboard → Help → Contact Support
- **DPO ZS-PAS** : dpo@zs-pas.sante.gouv.bj / +229 20 21 00 00
- **MCZ** : Dr Alphonse KOSSI / +229 20 21 23 45
- **APDP Bénin** : +229 21 30 12 34 / apdp@gouv.bj

---

*Procédure validée : Octobre 2026 | Version 1.0 | Prochain test DR : Janvier 2027*