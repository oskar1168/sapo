import { PartnerProduct } from '../data/partnerProducts';
import { ensureSupabaseSession, isSupabaseConfigured, supabase } from '../lib/supabase';

export async function recordPartnerProductClick(product: PartnerProduct) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const user = await ensureSupabaseSession();
    if (!user) return;

    const { error } = await supabase.from('partner_clicks').insert({
      user_id: user.id,
      provider: product.provider,
      city: product.cityCode,
      category: product.category,
      product_id: product.id,
      product_name: product.title,
      target_url: product.targetUrl,
    });

    if (error) throw error;
  } catch (error) {
    console.warn('Partner click tracking failed:', error);
  }
}
