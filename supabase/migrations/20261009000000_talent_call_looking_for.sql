-- What a creative is looking for from Huo (optional, pick any). The form drops
-- this field and retries if the column is missing, so apply at any time.

alter table public.talent_call_submissions
  add column looking_for text[]
    check (looking_for <@ array['paid_work','collabs','networking','learning']);
