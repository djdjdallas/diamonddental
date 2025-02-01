// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for common database operations
export const getPatients = async () => {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const addPatient = async (patientData) => {
  const { data, error } = await supabase
    .from("patients")
    .insert(patientData)
    .select();

  if (error) throw error;
  return data[0];
};

export const getAppointments = async () => {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      patients (
        first_name,
        last_name
      )
    `
    )
    .order("appointment_date", { ascending: true });

  if (error) throw error;
  return data;
};

export const addAppointment = async (appointmentData) => {
  const { data, error } = await supabase
    .from("appointments")
    .insert(appointmentData)
    .select();

  if (error) throw error;
  return data[0];
};
