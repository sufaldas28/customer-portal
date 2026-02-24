import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://fpyrlqkmorzfmtpfbvqo.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImViYTI1MDM0LTNkNDYtNGU2ZC05MmUwLTc1ODUxNTAwMGI0YiJ9.eyJwcm9qZWN0SWQiOiJmcHlybHFrbW9yemZtdHBmYnZxbyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcwODYwNDgyLCJleHAiOjIwODYyMjA0ODIsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.nG17cXnGFFQXzL3A0xUPRxpNDeS--m17quIitHlc-E0';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };