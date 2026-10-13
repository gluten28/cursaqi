-- ==========================================================
-- SCRIPT SQL: Adicionar Coluna 'link_url' na tabela 'promo_banners'
-- Para ser executado no SQL Editor do Supabase (Opcional)
-- Permite que anúncios tenham links externos ou páginas específicas
-- ==========================================================

ALTER TABLE public.promo_banners ADD COLUMN IF NOT EXISTS link_url TEXT;

