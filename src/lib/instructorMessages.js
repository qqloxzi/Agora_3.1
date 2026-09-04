import { supabase } from './supabase'

export async function sendInstructorMessage({ senderId, name, email, phone, instructorId, instructorName, body }) {
  return supabase.from('instructor_messages').insert({
    sender_id: senderId ?? null,
    sender_name: name.trim(),
    sender_email: email.trim(),
    sender_phone: phone?.trim() || null,
    instructor_id: instructorId,
    instructor_name: instructorName,
    body: body.trim(),
  })
}

export async function fetchInstructorMessages() {
  const { data, error } = await supabase
    .from('instructor_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function markInstructorMessageRead(id, isRead = true) {
  return supabase.from('instructor_messages').update({ is_read: isRead }).eq('id', id)
}

export async function deleteInstructorMessage(id) {
  return supabase.from('instructor_messages').delete().eq('id', id)
}
