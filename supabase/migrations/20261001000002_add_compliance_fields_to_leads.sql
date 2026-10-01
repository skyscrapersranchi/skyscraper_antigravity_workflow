-- Migration: Add compliance (consent) and geolocation fields to public.leads
-- and update public.submit_lead function with validation and activity logging.

-- 1. Add compliance columns to public.leads
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS consent boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS consent_text text,
  ADD COLUMN IF NOT EXISTS consent_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric;

-- 2. Create or replace public.submit_lead RPC function
CREATE OR REPLACE FUNCTION public.submit_lead(
  name text,
  phone text,
  email text DEFAULT NULL,
  project text DEFAULT 'General',
  interest text DEFAULT NULL,
  message text DEFAULT NULL,
  form_type text DEFAULT 'enquire',
  page_url text DEFAULT NULL,
  referrer text DEFAULT NULL,
  utm_source text DEFAULT NULL,
  utm_medium text DEFAULT NULL,
  utm_campaign text DEFAULT NULL,
  consent boolean DEFAULT true,
  consent_text text DEFAULT NULL,
  consent_at timestamptz DEFAULT now(),
  lat numeric DEFAULT NULL,
  lng numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_name text;
  v_raw_phone text;
  v_digits text;
  v_normalized_phone text;
  v_email text;
  v_project text;
  v_project_id uuid := NULL;
  v_project_name text := NULL;
  v_interest text;
  v_message text;
  v_form_type text;
  v_page_url text;
  v_referrer text;
  v_utm_source text;
  v_utm_medium text;
  v_utm_campaign text;
  v_consent boolean;
  v_consent_text text;
  v_consent_at timestamptz;
  v_lat numeric;
  v_lng numeric;
  v_existing_lead_id uuid;
  v_new_lead_id uuid;
  v_activity_notes text;
  v_bhk_type text := NULL;
BEGIN
  -- 1. Validate & sanitize Name (required, max 100)
  v_name := trim(submit_lead.name);
  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'Name is required' USING ERRCODE = '22023';
  END IF;
  IF length(v_name) > 100 THEN
    RAISE EXCEPTION 'Name must not exceed 100 characters' USING ERRCODE = '22023';
  END IF;

  -- 2. Validate & normalize Phone (required, +91XXXXXXXXXX)
  v_raw_phone := trim(submit_lead.phone);
  IF v_raw_phone IS NULL OR v_raw_phone = '' THEN
    RAISE EXCEPTION 'Phone is required' USING ERRCODE = '22023';
  END IF;
  
  -- Extract digits only
  v_digits := regexp_replace(v_raw_phone, '[^\d]', '', 'g');
  -- Handle leading 0 (e.g. 0XXXXXXXXXX -> XXXXXXXXXX)
  IF length(v_digits) = 11 AND v_digits LIKE '0%' THEN
    v_digits := substr(v_digits, 2);
  -- Handle country code 91 (e.g. 91XXXXXXXXXX -> XXXXXXXXXX)
  ELSIF length(v_digits) = 12 AND v_digits LIKE '91%' THEN
    v_digits := substr(v_digits, 3);
  END IF;

  -- Validate 10-digit Indian mobile format (starting with 6, 7, 8, or 9)
  IF v_digits !~ '^[6-9][0-9]{9}$' THEN
    RAISE EXCEPTION 'Invalid phone number. Must be a valid 10-digit Indian phone number.' USING ERRCODE = '22023';
  END IF;
  v_normalized_phone := '+91' || v_digits;

  -- 3. Validate Email (optional, validated)
  v_email := nullif(trim(submit_lead.email), '');
  IF v_email IS NOT NULL AND v_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format' USING ERRCODE = '22023';
  END IF;

  -- 4. Validate Form Type (allowed: enquire, floor_plan, site_visit, contact)
  v_form_type := lower(trim(coalesce(submit_lead.form_type, 'enquire')));
  IF v_form_type NOT IN ('enquire', 'floor_plan', 'site_visit', 'contact') THEN
    RAISE EXCEPTION 'Invalid form_type: %. Allowed: enquire, floor_plan, site_visit, contact', v_form_type USING ERRCODE = '22023';
  END IF;

  -- 5. Validate Project (allowed values only)
  v_project := trim(submit_lead.project);
  IF v_project IS NULL OR v_project = '' OR v_project ILIKE '%general%' THEN
    v_project_id := NULL;
    v_project_name := 'General Skyscraper Portfolio';
  ELSIF v_project ILIKE '%deonarayan%' THEN
    v_project_id := '5feb554a-f976-4b8b-b1a0-5625ecb8cc24'::uuid;
    v_project_name := 'Deonarayan Estate';
  ELSIF v_project ILIKE '%anima%' THEN
    v_project_id := '2f78cf88-6310-4056-a2b7-a7a0461bbd3c'::uuid;
    v_project_name := 'Anima Sky Residency';
  ELSE
    RAISE EXCEPTION 'Invalid project: %. Allowed projects: Deonarayan Estate, Anima Sky Residency, General', v_project USING ERRCODE = '22023';
  END IF;

  -- 6. Validate Message (max 1000)
  v_message := nullif(trim(submit_lead.message), '');
  IF v_message IS NOT NULL AND length(v_message) > 1000 THEN
    RAISE EXCEPTION 'Message must not exceed 1000 characters' USING ERRCODE = '22023';
  END IF;

  -- 7. Sanitize Interest & Tracking params
  v_interest := nullif(trim(submit_lead.interest), '');
  IF v_interest ILIKE '%3 BHK%' OR v_interest ILIKE '%3BHK%' THEN
    v_bhk_type := '3 BHK';
  END IF;
  
  v_page_url := nullif(trim(submit_lead.page_url), '');
  v_referrer := nullif(trim(submit_lead.referrer), '');
  v_utm_source := nullif(trim(submit_lead.utm_source), '');
  v_utm_medium := nullif(trim(submit_lead.utm_medium), '');
  v_utm_campaign := nullif(trim(submit_lead.utm_campaign), '');
  
  -- Consent details
  v_consent := coalesce(submit_lead.consent, true);
  v_consent_text := nullif(trim(submit_lead.consent_text), '');
  v_consent_at := coalesce(submit_lead.consent_at, now());

  -- Geolocation (rounded to 3 decimal places)
  IF submit_lead.lat IS NOT NULL THEN
    v_lat := round(submit_lead.lat::numeric, 3);
  ELSE
    v_lat := NULL;
  END IF;
  IF submit_lead.lng IS NOT NULL THEN
    v_lng := round(submit_lead.lng::numeric, 3);
  ELSE
    v_lng := NULL;
  END IF;

  -- Format activity notes
  v_activity_notes := concat_ws(
    E'\n',
    'Form Type: ' || v_form_type,
    'Project: ' || coalesce(v_project_name, 'General'),
    CASE WHEN v_interest IS NOT NULL THEN 'Interest: ' || v_interest END,
    CASE WHEN v_message IS NOT NULL THEN 'Message: ' || v_message END,
    CASE WHEN v_email IS NOT NULL THEN 'Email: ' || v_email END,
    CASE WHEN v_consent IS NOT NULL THEN 'Consent: ' || v_consent::text END,
    CASE WHEN v_consent_text IS NOT NULL THEN 'Consent Text: "' || v_consent_text || '"' END,
    CASE WHEN v_consent_at IS NOT NULL THEN 'Consent At: ' || v_consent_at::text END,
    CASE WHEN v_lat IS NOT NULL AND v_lng IS NOT NULL THEN 'Location: ' || v_lat::text || ', ' || v_lng::text END,
    CASE WHEN v_utm_source IS NOT NULL THEN 'UTM Source: ' || v_utm_source END,
    CASE WHEN v_utm_medium IS NOT NULL THEN 'UTM Medium: ' || v_utm_medium END,
    CASE WHEN v_utm_campaign IS NOT NULL THEN 'UTM Campaign: ' || v_utm_campaign END,
    CASE WHEN v_page_url IS NOT NULL THEN 'Page URL: ' || v_page_url END,
    CASE WHEN v_referrer IS NOT NULL THEN 'Referrer: ' || v_referrer END
  );

  -- 8. Check for existing lead with same normalized phone
  SELECT l.id INTO v_existing_lead_id
  FROM public.leads l
  WHERE l.phone = v_normalized_phone
  ORDER BY l.created_at DESC
  LIMIT 1;

  IF v_existing_lead_id IS NOT NULL THEN
    -- Repeat enquiry: add activity "Repeat website enquiry"
    INSERT INTO public.activities (
      lead_id,
      type,
      subject,
      notes,
      occurred_at
    ) VALUES (
      v_existing_lead_id,
      'note'::activity_type,
      'Repeat website enquiry',
      v_activity_notes,
      now()
    );

    -- Update last_contacted_at on the lead (and update lat/lng if newly provided)
    UPDATE public.leads l
    SET last_contacted_at = now(),
        updated_at = now(),
        lat = coalesce(v_lat, l.lat),
        lng = coalesce(v_lng, l.lng)
    WHERE l.id = v_existing_lead_id;

  ELSE
    -- New lead: insert at default "new" stage, source = 'website'
    INSERT INTO public.leads (
      full_name,
      phone,
      email,
      source,
      stage,
      project_id,
      requirement,
      bhk_type,
      message,
      notes,
      consent,
      consent_text,
      consent_at,
      lat,
      lng,
      utm_source,
      utm_medium,
      utm_campaign,
      page_url,
      referrer,
      form_type,
      created_at,
      updated_at
    ) VALUES (
      v_name,
      v_normalized_phone,
      v_email,
      'website'::lead_source,
      'new'::lead_stage,
      v_project_id,
      v_interest,
      v_bhk_type,
      v_message,
      v_activity_notes,
      v_consent,
      v_consent_text,
      v_consent_at,
      v_lat,
      v_lng,
      v_utm_source,
      v_utm_medium,
      v_utm_campaign,
      v_page_url,
      v_referrer,
      v_form_type,
      now(),
      now()
    ) RETURNING leads.id INTO v_new_lead_id;

    -- Add activity "New website enquiry"
    INSERT INTO public.activities (
      lead_id,
      type,
      subject,
      notes,
      occurred_at
    ) VALUES (
      v_new_lead_id,
      'note'::activity_type,
      'New website enquiry',
      v_activity_notes,
      now()
    );
  END IF;

  -- Return ONLY { ok: true }, never exposing lead data
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION public.submit_lead TO anon, authenticated;
