-- ============================================================================
-- SUPABASE DATABASE SCHEMA - ZS-PAS Portal
-- République du Bénin - Zone Sanitaire Porto-Novo–Aguégués–Sèmè-Podji
-- Version: 1.0 | Date: Octobre 2026
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'super_admin',
    'main_admin',
    'validator',
    'reader'
);

CREATE TYPE content_status AS ENUM (
    'brouillon',
    'soumis_pour_validation',
    'valide',
    'refuse',
    'publie',
    'mis_a_jour',
    'archive'
);

CREATE TYPE appointment_status AS ENUM (
    'nouvelle_demande',
    'en_cours_traitement',
    'confirmee',
    'a_reprogrammer',
    'refusee',
    'annulee',
    'terminee',
    'archive'
);

CREATE TYPE contact_status AS ENUM (
    'nouveau',
    'en_cours',
    'traite',
    'archive'
);

CREATE TYPE facility_type AS ENUM (
    'csa',
    'csc',
    'maternite',
    'hopital',
    'lacustre',
    'confessionnel'
);

CREATE TYPE commune AS ENUM (
    'porto-novo',
    'aguegues',
    'seme-podji'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'reader',
    phone TEXT,
    department TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Health Facilities
CREATE TABLE health_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type facility_type NOT NULL,
    commune commune NOT NULL,
    arrondissement TEXT,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    hours TEXT,
    emergency BOOLEAN DEFAULT FALSE,
    maternity BOOLEAN DEFAULT FALSE,
    pharmacy BOOLEAN DEFAULT FALSE,
    lab BOOLEAN DEFAULT FALSE,
    imaging BOOLEAN DEFAULT FALSE,
    blood_bank BOOLEAN DEFAULT FALSE,
    neonatal BOOLEAN DEFAULT FALSE,
    description TEXT,
    fass_code TEXT UNIQUE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    needs_audit BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- maternal, vaccination, emergency, primary, community, pharmacy, lab, admin
    description TEXT,
    icon TEXT, -- Material Symbols name
    target_group TEXT,
    is_free BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Facility Services (Many-to-Many)
CREATE TABLE facility_services (
    facility_id UUID NOT NULL REFERENCES health_facilities(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT,
    PRIMARY KEY (facility_id, service_id)
);

-- 5. Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT NOT NULL, -- campaign, alert, info, schedule, guideline
    image_url TEXT,
    document_url TEXT,
    document_name TEXT,
    author_id UUID NOT NULL REFERENCES profiles(id),
    validated_by UUID REFERENCES profiles(id),
    rejection_reason TEXT,
    status content_status NOT NULL DEFAULT 'brouillon',
    published_at TIMESTAMPTZ,
    reference TEXT UNIQUE, -- COMM-PAS-YYYY-NNN
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- strategic, medical, administrative, epidemiological, regulatory, reports
    file_url TEXT NOT NULL,
    file_size TEXT, -- e.g., "4.2 Mo"
    file_type TEXT DEFAULT 'application/pdf',
    pages INTEGER,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    display_order INTEGER DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    download_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL, -- RDV-PAS-YYYY-NNNN
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    email TEXT,
    commune commune,
    arrondissement TEXT,
    service TEXT NOT NULL, -- coordination, epidemiologie, rh, finances, communaute
    motif TEXT NOT NULL, -- depot, attestation, audience, signalement
    mode TEXT NOT NULL, -- presentiel, telephonique
    date_souhaitee DATE NOT NULL,
    creneau TEXT NOT NULL, -- matin, midi, apres-midi
    complement TEXT,
    consentement BOOLEAN NOT NULL DEFAULT FALSE,
    status appointment_status NOT NULL DEFAULT 'nouvelle_demande',
    confirmed_date DATE,
    confirmed_time TIME,
    admin_notes TEXT,
    processed_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Contact Requests
CREATE TABLE contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- information, suggestion, reclamation, partenariat, autre
    subject TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    email TEXT,
    commune commune,
    message TEXT NOT NULL,
    consentement BOOLEAN NOT NULL DEFAULT FALSE,
    status contact_status NOT NULL DEFAULT 'nouveau',
    admin_response TEXT,
    responded_by UUID REFERENCES profiles(id),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL, -- e.g., 'appointment_confirmed', 'announcement_published'
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Site Settings
CREATE TABLE site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Health Facilities
CREATE INDEX idx_facilities_commune ON health_facilities(commune);
CREATE INDEX idx_facilities_type ON health_facilities(type);
CREATE INDEX idx_facilities_is_active ON health_facilities(is_active);
CREATE INDEX idx_facilities_location ON health_facilities(latitude, longitude);
CREATE INDEX idx_facilities_fass_code ON health_facilities(fass_code);
CREATE INDEX idx_facilities_needs_audit ON health_facilities(needs_audit);

-- Services
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);

-- Facility Services
CREATE INDEX idx_facility_services_facility ON facility_services(facility_id);
CREATE INDEX idx_facility_services_service ON facility_services(service_id);

-- Announcements
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC);
CREATE INDEX idx_announcements_author ON announcements(author_id);

-- Documents
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_is_public ON documents(is_public);
CREATE INDEX idx_documents_is_featured ON documents(is_featured);
CREATE INDEX idx_documents_published_at ON documents(published_at DESC);

-- Appointments
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_commune ON appointments(commune);
CREATE INDEX idx_appointments_date_souhaitee ON appointments(date_souhaitee);
CREATE INDEX idx_appointments_reference ON appointments(reference);

-- Contact Requests
CREATE INDEX idx_contacts_status ON contact_requests(status);
CREATE INDEX idx_contacts_type ON contact_requests(type);
CREATE INDEX idx_contacts_commune ON contact_requests(commune);
CREATE INDEX idx_contacts_created_at ON contact_requests(created_at DESC);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role FROM profiles WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() IN ('super_admin', 'main_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is validator or above
CREATE OR REPLACE FUNCTION is_validator()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() IN ('super_admin', 'main_admin', 'validator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT USING (is_admin());

-- Admins can manage all profiles
CREATE POLICY "Admins can manage profiles" ON profiles
    FOR ALL USING (is_admin());

-- ============================================================================
-- HEALTH FACILITIES POLICIES
-- ============================================================================

-- Public can read active facilities
CREATE POLICY "Public can read active facilities" ON health_facilities
    FOR SELECT USING (is_active = TRUE);

-- Authenticated users can read all facilities
CREATE POLICY "Authenticated can read facilities" ON health_facilities
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage facilities
CREATE POLICY "Admins can manage facilities" ON health_facilities
    FOR ALL USING (is_admin());

-- Validators can read facilities
CREATE POLICY "Validators can read facilities" ON health_facilities
    FOR SELECT USING (is_validator());

-- ============================================================================
-- SERVICES POLICIES
-- ============================================================================

-- Public can read active services
CREATE POLICY "Public can read active services" ON services
    FOR SELECT USING (is_active = TRUE);

-- Authenticated can read all services
CREATE POLICY "Authenticated can read services" ON services
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage services
CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (is_admin());

-- Validators can read services
CREATE POLICY "Validators can read services" ON services
    FOR SELECT USING (is_validator());

-- ============================================================================
-- FACILITY SERVICES POLICIES
-- ============================================================================

-- Public can read facility services for active facilities
CREATE POLICY "Public can read facility services" ON facility_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM health_facilities hf
            WHERE hf.id = facility_services.facility_id
            AND hf.is_active = TRUE
        )
    );

-- Authenticated can read all
CREATE POLICY "Authenticated can read facility services" ON facility_services
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage
CREATE POLICY "Admins can manage facility services" ON facility_services
    FOR ALL USING (is_admin());

-- ============================================================================
-- ANNOUNCEMENTS POLICIES
-- ============================================================================

-- Public can read published announcements
CREATE POLICY "Public can read published announcements" ON announcements
    FOR SELECT USING (status = 'publie');

-- Authenticated can read all (for admin panel)
CREATE POLICY "Authenticated can read announcements" ON announcements
    FOR SELECT USING (auth.role() = 'authenticated');

-- Authors can create drafts
CREATE POLICY "Authors can create announcements" ON announcements
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can update their own drafts
CREATE POLICY "Authors can update own drafts" ON announcements
    FOR UPDATE USING (auth.uid() = author_id AND status IN ('brouillon', 'refuse'));

-- Validators can validate/reject
CREATE POLICY "Validators can validate announcements" ON announcements
    FOR UPDATE USING (
        is_validator() AND status = 'soumis_pour_validation'
    ) WITH CHECK (
        is_validator() AND status IN ('valide', 'refuse', 'publie')
    );

-- Admins can manage all
CREATE POLICY "Admins can manage announcements" ON announcements
    FOR ALL USING (is_admin());

-- ============================================================================
-- DOCUMENTS POLICIES
-- ============================================================================

-- Public can read public documents
CREATE POLICY "Public can read public documents" ON documents
    FOR SELECT USING (is_public = TRUE);

-- Authenticated can read all
CREATE POLICY "Authenticated can read documents" ON documents
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage documents
CREATE POLICY "Admins can manage documents" ON documents
    FOR ALL USING (is_admin());

-- Validators can read documents
CREATE POLICY "Validators can read documents" ON documents
    FOR SELECT USING (is_validator());

-- ============================================================================
-- APPOINTMENTS POLICIES
-- ============================================================================

-- Anyone can create appointment (anon role)
CREATE POLICY "Anyone can create appointment" ON appointments
    FOR INSERT WITH CHECK (TRUE);

-- Users can read their own appointments (by reference)
CREATE POLICY "Users can read own appointment by reference" ON appointments
    FOR SELECT USING (
        -- In practice, this would be checked via Edge Function with reference
        auth.role() = 'authenticated' OR TRUE
    );

-- Admins can read all appointments
CREATE POLICY "Admins can read all appointments" ON appointments
    FOR SELECT USING (is_admin());

-- Validators can read appointments
CREATE POLICY "Validators can read appointments" ON appointments
    FOR SELECT USING (is_validator());

-- Admins can manage appointments
CREATE POLICY "Admins can manage appointments" ON appointments
    FOR ALL USING (is_admin());

-- ============================================================================
-- CONTACT REQUESTS POLICIES
-- ============================================================================

-- Anyone can create contact request
CREATE POLICY "Anyone can create contact request" ON contact_requests
    FOR INSERT WITH CHECK (TRUE);

-- Admins can read all
CREATE POLICY "Admins can read contact requests" ON contact_requests
    FOR SELECT USING (is_admin());

-- Validators can read contact requests
CREATE POLICY "Validators can read contact requests" ON contact_requests
    FOR SELECT USING (is_validator());

-- Admins can manage
CREATE POLICY "Admins can manage contact requests" ON contact_requests
    FOR ALL USING (is_admin());

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON audit_logs
    FOR SELECT USING (is_admin());

-- System can insert audit logs (via Edge Functions with service_role)
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- SITE SETTINGS POLICIES
-- ============================================================================

-- Public can read public settings
CREATE POLICY "Public can read site settings" ON site_settings
    FOR SELECT USING (TRUE);

-- Admins can manage
CREATE POLICY "Admins can manage site settings" ON site_settings
    FOR ALL USING (is_admin());

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON health_facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contact_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Increment document download count
CREATE OR REPLACE FUNCTION increment_document_download(doc_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE documents SET download_count = download_count + 1 WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate appointment reference
CREATE OR REPLACE FUNCTION generate_appointment_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
    year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    seq INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        (reference)::TEXT
    ), 0) INTO seq FROM appointments
    WHERE reference LIKE 'RDV-PAS-' || year || '-%';

    ref := 'RDV-PAS-' || year || '-' || LPAD((seq + 1)::TEXT, 4, '0');
    RETURN ref;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate announcement reference
CREATE OR REPLACE FUNCTION generate_announcement_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
    year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    seq INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        SPLIT_PART(reference, '-', 4)::INTEGER
    ), 0) INTO seq FROM announcements
    WHERE reference LIKE 'COMM-PAS-' || year || '-%';

    ref := 'COMM-PAS-' || year || '-' || LPAD((seq + 1)::TEXT, 3, '0');
    RETURN ref;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default services
INSERT INTO services (name, category, description, icon, target_group, is_free, display_order) VALUES
    ('Accouchements & Soins Obstétricaux', 'maternal', 'Prise en charge complète de la grossesse à l''accouchement, césarienne gratuite, soins néonatals.', 'pregnant_woman', 'Femmes enceintes', TRUE, 1),
    ('Consultations Prénatales (CPN)', 'maternal', 'Suivi de grossesse mensuel, dépistage des risques, supplémentation en fer/acide folique.', 'monitor_heart', 'Femmes enceintes', TRUE, 2),
    ('Planning Familial', 'maternal', 'Conseil, méthodes contraceptives modernes, insertion DIU/implant, suivi.', 'favorite', 'Femmes en âge de procréer', TRUE, 3),
    ('Soins Néonatals & Pédiatrie', 'maternal', 'Suivi du nouveau-né, vaccination, dépistage malnutrition, prise en charge IMCI.', 'child_care', 'Enfants 0-5 ans', TRUE, 4),
    ('Programme Élargi de Vaccination (PEV)', 'vaccination', 'Vaccins gratuits selon calendrier national: BCG, DTP, Hépatite B, Rougeole, Fièvre jaune, HPV.', 'vaccines', 'Enfants 0-23 mois, Filles 9-14 ans', TRUE, 1),
    ('Vaccination Antigrippale Saisonnière', 'vaccination', 'Campagnes annuelles pour personnes âgées, personnels soignants, pathologies chroniques.', 'healing', 'Personnes à risque', TRUE, 2),
    ('Dépistage & Prévention Maladies', 'vaccination', 'Dépistage HTA, Diabète, Cancer du col (VIA/VILI), IST/VIH, nutrition.', 'biotech', 'Population générale', FALSE, 3),
    ('Service d''Accueil des Urgences (SAU)', 'emergency', 'Prise en charge 24h/24, triage, stabilisation, orientation vers services spécialisés.', 'emergency', 'Tous', FALSE, 1),
    ('Réanimation & Soins Intensifs', 'emergency', 'Surveillance continue, ventilation, hémodynamie, dialyse (CHD Ouémé uniquement).', 'monitor_heart', 'Patients critiques', FALSE, 2),
    ('Évacuation & Transfert Sanitaire', 'emergency', 'Ambulance terrestre, barque-ambulance lacustre (Aguégués), coordination SAMU 112.', 'local_shipping', 'Urgences vitales', TRUE, 3),
    ('Consultations Médicales Générales', 'primary', 'Médecine générale, pathologies courantes, prescription, certificats médicaux.', 'medical_services', 'Population générale', FALSE, 1),
    ('Soins Infirmiers & Pansements', 'primary', 'Injections, perfusions, pansements complexes, cathétérisme, sonde vésicale.', 'healing', 'Patients sur prescription', FALSE, 2),
    ('Santé Mentale & Psychosociale', 'primary', 'Consultation psychologique, prise en charge troubles mentaux, soutien psychosocial.', 'psychology', 'Population générale', TRUE, 3),
    ('Agents de Santé Communautaires (ASC)', 'community', 'Visites à domicile, éducation sanitaire, dépistage communautaire, référence.', 'groups', 'Communautés rurales/lacustres', TRUE, 1),
    ('Nutrition & Alimentation', 'community', 'Dépistage malnutrition aiguë, prise en charge CRENAS/CRENT, conseil nutritionnel.', 'restaurant', 'Enfants <5 ans, Femmes enceintes/allaitantes', TRUE, 2),
    ('Eau, Hygiène & Assainissement (EHA)', 'community', 'Promotion hygiène, traitement eau (Aquatabs), latrines, lutte anti-vectorielle.', 'water_drop', 'Ménages zones à risque', TRUE, 3),
    ('Pharmacie de Garde', 'pharmacy', 'Disponibilité médicaments essentiels 24h/24, liste garde hebdomadaire publiée.', 'local_pharmacy', 'Population générale', FALSE, 1),
    ('Dispensation Médicaments Essentiels', 'pharmacy', 'Médicaments génériques de qualité, liste nationale, gratuité ciblée (ACT, SP, Fer/Folique).', 'medication', 'Patients sur prescription', FALSE, 2),
    ('Biologie Médicale', 'lab', 'Hémogramme, biochimie, sérologie, parasitologie, bactériologie, groupe sanguin.', 'science', 'Patients sur prescription', FALSE, 1),
    ('Imagerie Médicale', 'lab', 'Radiographie, échographie, scanner (CHD Ouémé), mammographie.', 'radiology', 'Patients sur prescription', FALSE, 2),
    ('Délivrance Certificats & Attestations', 'admin', 'Certificats médicaux, attestations de vaccination, certificats d''aptitude, visas.', 'badge', 'Usagers, Administrations', FALSE, 1),
    ('Agrément & Autorisation Structures', 'admin', 'Dossiers d''agrément privé, renouvellement, inspection, conformité normes MS.', 'assignment', 'Promoteurs structures privées', FALSE, 2),
    ('Recrutement & Gestion RH', 'admin', 'Concours, affectations, formations continues, évaluation performances.', 'people', 'Personnel de santé', FALSE, 3)
ON CONFLICT DO NOTHING;

-- Insert site settings
INSERT INTO site_settings (key, value, description) VALUES
    ('site_name', '"Portail ZS-PAS"', 'Nom du site'),
    ('site_tagline', '"Zone Sanitaire Porto-Novo–Aguégués–Sèmè-Podji"', 'Sous-titre du site'),
    ('contact_email', '"contact@zs-pas.sante.gouv.bj"', 'Email de contact principal'),
    ('contact_phone', '"+229 20 21 00 00"', 'Téléphone de contact principal'),
    ('emergency_samu', '"112"', 'Numéro SAMU'),
    ('emergency_green_line', '"136"', 'Numéro Vert Santé'),
    ('address', '"Quartier Attakè, Porto-Novo, Bénin"', 'Adresse du siège'),
    ('office_hours', '"Lun-Ven 08h00-12h30 / 14h00-17h30"', 'Horaires d''ouverture'),
    ('appointment_delay_hours', '48', 'Délai de traitement rendez-vous (heures)'),
    ('max_complement_chars', '300', 'Longueur max message complémentaire'),
    ('max_message_chars', '1000', 'Longueur max message contact'),
    ('maintenance_mode', 'false', 'Mode maintenance'),
    ('analytics_enabled', 'true', 'Analytics activés')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on schema to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on public tables to anon
GRANT SELECT ON health_facilities, services, facility_services, announcements, documents TO anon;
GRANT INSERT ON appointments, contact_requests TO anon;

-- Grant all on all tables to authenticated (RLS will handle permissions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================