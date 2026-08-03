-- ==========================================================
-- SCRIPT SQL: Criação da Tabela 'materials' e Bucket 'documentos'
-- Para ser executado no SQL Editor do Supabase
-- ==========================================================

-- 1. Criar a tabela 'materials' para armazenar os metadados dos materiais didáticos
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'pdf',
    size TEXT NOT NULL DEFAULT '0 KB',
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Segurança a Nível de Linha (RLS)
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso à tabela 'materials'
CREATE POLICY "Permitir leitura pública dos materiais" 
ON public.materials 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção de materiais para utilizadores autenticados" 
ON public.materials 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização de materiais" 
ON public.materials 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir eliminação de materiais" 
ON public.materials 
FOR DELETE 
USING (true);


-- 2. Criar o Bucket de Armazenamento no Supabase Storage ('documentos')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos', 
  'documentos', 
  true, 
  52428800, -- Limite max 50MB por ficheiro (opcional)
  ARRAY[
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/zip', 
    'application/x-zip-compressed',
    'image/png', 
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Acesso RLS para o Bucket 'documentos' no Supabase Storage
CREATE POLICY "Acesso público de leitura no bucket documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'documentos');

CREATE POLICY "Permitir upload no bucket documentos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Permitir atualização no bucket documentos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documentos');

CREATE POLICY "Permitir remoção no bucket documentos"
ON storage.objects FOR DELETE
USING (bucket_id = 'documentos');
