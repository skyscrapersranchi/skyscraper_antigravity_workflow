/**
 * CRM Lead Submission Module
 * Directly connects website enquiry entry points to Supabase CRM RPC
 * Project: skyscrapers-skyline-crm
 * Zero visual alteration / Zero DOM mutation
 */

(function (window) {
  'use strict';

  const SUPABASE_URL = 'https://xghpnfsrmdmglsjtbmhu.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_Ky-Os0ycOiJ5ARJsAxamaA_gPgQkMk6';
  const COOLDOWN_MS = 10000;

  let lastSubmitTime = 0;

  // Extract UTM parameters safely from current URL
  function getUtmParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        utm_source: params.get('utm_source') || null,
        utm_medium: params.get('utm_medium') || null,
        utm_campaign: params.get('utm_campaign') || null
      };
    } catch (e) {
      return { utm_source: null, utm_medium: null, utm_campaign: null };
    }
  }

  // Derive form_type enum from intent string
  function resolveFormType(intent) {
    if (!intent) return 'enquire';
    const lower = intent.toLowerCase();
    if (lower.includes('floor plan') || lower.includes('folio') || lower.includes('cad') || lower.includes('documentation')) {
      return 'floor_plan';
    }
    if (lower.includes('site visit') || lower.includes('on-site') || lower.includes('presentation')) {
      return 'site_visit';
    }
    if (lower.includes('general') || lower.includes('inquiry') || lower.includes('conversation') || lower.includes('touch')) {
      return 'contact';
    }
    return 'enquire';
  }

  // Setup invisible off-screen honeypot field
  function setupHoneypot(form) {
    if (!form || form.querySelector('#_website_hp_check')) return;
    const hp = document.createElement('input');
    hp.type = 'text';
    hp.name = '_website_hp_check';
    hp.id = '_website_hp_check';
    hp.tabIndex = -1;
    hp.setAttribute('aria-hidden', 'true');
    hp.setAttribute('autocomplete', 'off');
    hp.style.position = 'absolute';
    hp.style.left = '-9999px';
    hp.style.top = '-9999px';
    hp.style.opacity = '0';
    hp.style.pointerEvents = 'none';
    hp.style.width = '0';
    hp.style.height = '0';
    hp.style.margin = '0';
    hp.style.padding = '0';
    hp.style.border = 'none';
    form.appendChild(hp);
  }

  // Initialize honeypot once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('enquiryForm');
      if (form) setupHoneypot(form);
    });
  } else {
    const form = document.getElementById('enquiryForm');
    if (form) setupHoneypot(form);
  }

  /**
   * Submit lead to Supabase RPC submit_lead
   * @param {Object} payload 
   * @returns {Promise<{ ok: boolean, error?: any }>}
   */
  async function submitLead(payload) {
    // 1. Spam check: Honeypot verification
    const hp = document.getElementById('_website_hp_check');
    if (hp && hp.value) {
      console.warn('[CRM] Honeypot triggered, submission ignored.');
      return { ok: true };
    }

    // 2. Spam check: 10-second client cooldown
    const now = Date.now();
    if (now - lastSubmitTime < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - lastSubmitTime)) / 1000);
      console.warn(`[CRM] Submission throttled: ${wait}s cooldown active.`);
      return { ok: true };
    }

    // 3. Auto-capture parameters
    const utms = getUtmParams();
    const resolvedType = payload.form_type || resolveFormType(payload.interest);

    const rpcPayload = {
      name: payload.name,
      phone: payload.phone,
      email: payload.email || null,
      project: payload.project || 'General',
      interest: payload.interest || null,
      message: payload.message || payload.notes || null,
      form_type: resolvedType,
      page_url: window.location.href,
      referrer: document.referrer || null,
      utm_source: utms.utm_source,
      utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign,
      consent: payload.consent !== undefined ? payload.consent : true,
      consent_text: payload.consent_text || 'By submitting, you agree to be contacted by Skyscraper about your enquiry by phone, WhatsApp or email.',
      consent_at: payload.consent_at || new Date().toISOString(),
      lat: payload.lat !== undefined && payload.lat !== null ? Math.round(Number(payload.lat) * 1000) / 1000 : null,
      lng: payload.lng !== undefined && payload.lng !== null ? Math.round(Number(payload.lng) * 1000) / 1000 : null
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_lead`, {
        method: 'POST',
        headers: {
          'apikey': PUBLISHABLE_KEY,
          'Authorization': `Bearer ${PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rpcPayload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        console.error('[CRM Submit Error]', response.status, errJson);
        return { ok: false, error: errJson };
      }

      lastSubmitTime = Date.now();
      return { ok: true };
    } catch (err) {
      console.error('[CRM Submit Exception]', err);
      return { ok: false, error: err };
    }
  }

  // Export functions to window
  window.submitLead = submitLead;
  window.resolveFormType = resolveFormType;

})(window);
