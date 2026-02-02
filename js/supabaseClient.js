import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://aktqvwresyuvoytnjmxn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdHF2d3Jlc3l1dm95dG5qbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDU3MTcsImV4cCI6MjA4MTIyMTcxN30.teOpIyBiYzw_Y2LKxNRAgh2DNNrojL-r0gBWntTKmT4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
