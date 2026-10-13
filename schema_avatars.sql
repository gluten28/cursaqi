-- ==========================================================
-- SCRIPT SQL: Criação do Bucket 'avatars' e Coluna 'avatar_url'
-- Para ser executado no SQL Editor do Supabase
-- ==========================================================

-- 1. Adicionar a coluna avatar_url na tabela users (se ainda não existir)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Criar o Bucket de Armazenamento no Supabase Storage ('avatars')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  10485760, -- Limite máximo de 10MB por foto de perfil
  ARRAY[
    'image/png', 
    'image/jpeg', 
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Políticas de Acesso RLS para o Bucket 'avatars' no Supabase Storage
DO $$
BEGIN
  -- Política de Leitura Pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Acesso público de leitura no bucket avatars'
  ) THEN
    CREATE POLICY "Acesso público de leitura no bucket avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;

  -- Política de Upload
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Permitir upload no bucket avatars'
  ) THEN
    CREATE POLICY "Permitir upload no bucket avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars');
  END IF;

  -- Política de Atualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Permitir atualização no bucket avatars'
  ) THEN
    CREATE POLICY "Permitir atualização no bucket avatars"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars');
  END IF;

  -- Política de Remoção
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Permitir remoção no bucket avatars'
  ) THEN
    CREATE POLICY "Permitir remoção no bucket avatars"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars');
  END IF;
END $$;

