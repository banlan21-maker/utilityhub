'use server';

import { supabase } from '@/lib/supabase';

export async function submitFeedback(formData: FormData) {
  const message = formData.get('message')?.toString();
  const category = formData.get('category')?.toString() || 'general';

  if (!message || message.trim().length === 0) {
    return { error: 'Message cannot be empty.' };
  }

  const { data, error } = await supabase
    .from('feedback')
    .insert([
      { message: message.trim(), category }
    ]);

  if (error) {
    console.error('Supabase insert error:', error);
    return { error: 'Failed to submit feedback. Please try again later.' };
  }

  return { success: true };
}
