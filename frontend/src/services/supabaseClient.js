import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xigqumnfheklfmoeixzs.supabase.co";
const supabaseKey = "sb_publishable_ofrP-8gd-JIrRtCmX0u9kA_XMo6xTTe";

export const supabase = createClient(supabaseUrl, supabaseKey);

