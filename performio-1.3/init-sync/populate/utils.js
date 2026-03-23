
// init-sync/populate/utils.js

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const CLINIKO_API_KEY = process.env.CLINIKO_MPPP_DASHBOARD_API;
const CLINIC_ID = process.env.MPP_CLINIC_ID;

// Fix: Extract the shard from the API key suffix (e.g., -au1)
// If your key doesn't have a dash, it defaults to 'au1'
const shard = CLINIKO_API_KEY.includes('-')
    ? CLINIKO_API_KEY.split('-').pop()
    : 'au1';

const BASE_URL = `https://api.${shard}.cliniko.com/v1`;

const headers = {
    'Authorization': `Basic ${Buffer.from(CLINIKO_API_KEY + ':').toString('base64')}`,
    'User-Agent': 'Performio Sync Engine (support@performio.app)',
    'Accept': 'application/json'
};

const parseClinikoId = (url) => {
    if (!url) return null;
    return url.split('/').pop();
};

module.exports = {
    supabase,
    axios,
    headers,
    BASE_URL,
    CLINIC_ID,
    parseClinikoId
};