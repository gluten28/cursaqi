-- ==============================================================================
-- SCRIPT SQL: ATIVAR PERMISSÕES DE UPLOAD NO BUCKET 'promo_banners' DO SUPABASE
-- Execute este script no SQL Editor do seu Supabase Dashboard (https://supabase.com)
-- ==============================================================================

-- 1. Garante que o bucket 'promo_banners' existe e está configurado como público
INSERT INTO storage.buckets (id, name, public)
VALUES ('promo_banners', 'promo_banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Limpa políticas anteriores se existirem para evitar conflitos de duplicação
DROP POLICY IF EXISTS "Permitir upload no bucket promo_banners" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública promo_banners" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização promo_banners" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão promo_banners" ON storage.objects;

-- 3. Habilita permissão de INSERT (Upload de fotos) para usuários anônimos e autenticados
CREATE POLICY "Permitir upload no bucket promo_banners"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'promo_banners');

-- 4. Habilita permissão de SELECT (Visualização das fotos no site pelos visitantes)
CREATE POLICY "Permitir leitura pública promo_banners"
ON storage.objects FOR SELECT
TO anon, authenticated, public
USING (bucket_id = 'promo_banners');

-- 5. Habilita permissão de UPDATE (Atualização de fotos existentes)
CREATE POLICY "Permitir atualização promo_banners"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'promo_banners');

-- 6. Habilita permissão de DELETE (Exclusão quando o anúncio for removido)
CREATE POLICY "Permitir exclusão promo_banners"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'promo_banners');

