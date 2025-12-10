-- Migration: Partage de projets et collaboration
-- Sprint 4 - Actions 15-18

-- ============================================
-- ACTION 15: PARTAGE DE PROJETS
-- ============================================

-- Table des projets partagés
CREATE TABLE IF NOT EXISTS shared_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  can_fork BOOLEAN DEFAULT TRUE,
  can_comment BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_shared_projects_token ON shared_projects(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_projects_project_id ON shared_projects(project_id);

-- ============================================
-- ACTION 17: COMMENTAIRES SUR PROJETS
-- ============================================

-- Table des commentaires
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les commentaires
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON project_comments(parent_id);

-- ============================================
-- ACTION 18: VERSIONING ET HISTORIQUE
-- ============================================

-- Table des versions de projets
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name TEXT,
  description TEXT,
  code TEXT,
  html TEXT,
  css TEXT,
  javascript TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les versions
CREATE INDEX IF NOT EXISTS idx_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON project_versions(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE shared_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_projects
-- Tout le monde peut voir les projets partagés publics (pour la page publique)
CREATE POLICY "Public can view public shared projects" ON shared_projects
  FOR SELECT USING (is_public = TRUE);

-- Les propriétaires peuvent tout gérer
CREATE POLICY "Users can manage their shared projects" ON shared_projects
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for project_comments
-- Tout le monde peut voir les commentaires sur les projets publics
CREATE POLICY "Public can view comments on public projects" ON project_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_projects sp
      WHERE sp.project_id = project_comments.project_id
      AND sp.is_public = TRUE
      AND sp.can_comment = TRUE
    )
  );

-- Les utilisateurs authentifiés peuvent commenter sur les projets publics
CREATE POLICY "Authenticated users can comment on public projects" ON project_comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM shared_projects sp
      WHERE sp.project_id = project_comments.project_id
      AND sp.is_public = TRUE
      AND sp.can_comment = TRUE
    )
  );

-- Les utilisateurs peuvent modifier/supprimer leurs propres commentaires
CREATE POLICY "Users can manage their own comments" ON project_comments
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for project_versions
-- Les propriétaires du projet peuvent voir et gérer les versions
CREATE POLICY "Project owners can view versions" ON project_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_versions.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can create versions" ON project_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_versions.project_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================
-- FONCTIONS UTILES
-- ============================================

-- Fonction pour générer un token de partage unique
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Générer un token aléatoire de 10 caractères
    token := substring(md5(random()::text || clock_timestamp()::text) from 1 for 10);
    
    -- Vérifier s'il existe déjà
    SELECT EXISTS(SELECT 1 FROM shared_projects WHERE share_token = token) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION increment_view_count(token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE shared_projects
  SET view_count = view_count + 1
  WHERE share_token = token;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optionnel - Pour tests)
-- ============================================

-- Vous pouvez ajouter des données de test ici si nécessaire
