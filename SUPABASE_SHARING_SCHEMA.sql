-- =====================================================
-- SPRINT 4 - SHARING & COLLABORATION SCHEMA
-- =====================================================
-- Execute this SQL in Supabase SQL Editor
-- Tables: project_shares, collaborators, comments, versions

-- =====================================================
-- TABLE: project_shares (Action 15)
-- Public sharing links for projects
-- =====================================================
CREATE TABLE IF NOT EXISTS project_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  can_fork BOOLEAN DEFAULT TRUE,
  can_comment BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_project_shares_token ON project_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_project_shares_project ON project_shares(project_id);

-- =====================================================
-- TABLE: collaborators (Action 16)
-- Real-time collaboration users
-- =====================================================
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cursor_position JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Index for fast presence lookup
CREATE INDEX IF NOT EXISTS idx_collaborators_project ON collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_online ON collaborators(project_id, is_online);

-- =====================================================
-- TABLE: comments (Action 17)
-- Comments on projects
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  line_number INTEGER,
  file_path TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for threaded comments
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- =====================================================
-- TABLE: versions (Action 18)
-- Version history for projects
-- =====================================================
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  tag TEXT,
  message TEXT,
  code_snapshot TEXT NOT NULL,
  html_snapshot TEXT,
  css_snapshot TEXT,
  javascript_snapshot TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, version_number)
);

-- Index for version lookup
CREATE INDEX IF NOT EXISTS idx_versions_project ON versions(project_id, version_number DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- project_shares policies
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares" ON project_shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shares" ON project_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shares" ON project_shares
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares" ON project_shares
  FOR DELETE USING (auth.uid() = user_id);

-- Public shares can be viewed by anyone with the token
CREATE POLICY "Public shares viewable by token" ON project_shares
  FOR SELECT USING (is_public = TRUE);

-- collaborators policies
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project collaborators" ON collaborators
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM collaborators c
      WHERE c.project_id = collaborators.project_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage collaborators" ON collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = collaborators.project_id
      AND p.user_id = auth.uid()
    )
  );

-- comments policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = comments.project_id
      AND (
        p.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators c
          WHERE c.project_id = p.id AND c.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create comments on accessible projects" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND (
        p.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators c
          WHERE c.project_id = p.id AND c.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- versions policies
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project versions" ON versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = versions.project_id
      AND (
        p.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators c
          WHERE c.project_id = p.id AND c.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create versions on own projects" ON versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate unique share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-increment version numbers
CREATE OR REPLACE FUNCTION get_next_version_number(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM versions
  WHERE project_id = p_project_id;
  
  RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-generate share token on insert
CREATE OR REPLACE FUNCTION set_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_token IS NULL THEN
    NEW.share_token := generate_share_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_share_token
  BEFORE INSERT ON project_shares
  FOR EACH ROW
  EXECUTE FUNCTION set_share_token();

-- Auto-set version number on insert
CREATE OR REPLACE FUNCTION set_version_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.version_number IS NULL THEN
    NEW.version_number := get_next_version_number(NEW.project_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_version_number
  BEFORE INSERT ON versions
  FOR EACH ROW
  EXECUTE FUNCTION set_version_number();

-- =====================================================
-- REALTIME (Action 16)
-- Enable realtime for collaboration
-- =====================================================

-- Enable realtime on collaborators table
ALTER PUBLICATION supabase_realtime ADD TABLE collaborators;

-- Enable realtime on comments table
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- =====================================================
-- DONE! Execute this entire file in Supabase SQL Editor
-- =====================================================
