import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://bacmfncqxqxstezedzxt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY21mbmNxeHF4c3RlemVkenh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyODI0NTIsImV4cCI6MjA1Mzg1ODQ1Mn0.FlFX5v4J4ON9pUDVALDAgkNXVsVL74K9bVNwmwwC_W4'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase; 