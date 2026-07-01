import { createClient } from '@supabase/supabase-js';

let client;

function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase configuration');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export async function insertDedication(data) {
  const { error } = await getSupabase().from('dedications').insert({
    name: data.name,
    hebrew_name: data.hebrew_name || null,
    occasion: data.occasion || null,
    amount: data.amount,
    note: data.note || null,
    source: data.source || null,
    lang: data.lang || 'en',
  });
  if (error) throw error;
}

export async function insertPartnerInquiry(data) {
  const { error } = await getSupabase().from('partner_inquiries').insert({
    name: data.name,
    hebrew_name: data.hebname || data.hebrew_name || null,
    contact: data.contact,
    tier: data.tier,
    note: data.note || null,
    lang: data.lang || 'en',
  });
  if (error) throw error;
}

export async function insertMailingSubscriber(data) {
  const { error } = await getSupabase().from('mailing_subscribers').insert({
    email: data.email,
  });
  if (error) throw error;
}
