-- Instagram is no longer required on its own. A creative must give at least one
-- place to see their work: Instagram, a portfolio link, or (models) a headshot link.

create or replace function public.cta_normalize()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(btrim(new.email));
  new.full_name := btrim(new.full_name);

  if tg_table_name = 'talent_call_submissions' then
    new.instagram_handle := nullif(lower(regexp_replace(btrim(new.instagram_handle), '^@+', '')), '');
    new.portfolio_url := nullif(btrim(new.portfolio_url), '');
    new.headshot_url := nullif(btrim(new.headshot_url), '');
    if new.refer_creative_handle is not null then
      new.refer_creative_handle := lower(regexp_replace(btrim(new.refer_creative_handle), '^@+', ''));
    end if;
  end if;

  -- server-controlled fields: ignore anything the client sent
  new.status := 'new';
  new.created_at := now();
  return new;
end;
$$;

alter table public.talent_call_submissions
  alter column instagram_handle drop not null;

alter table public.talent_call_submissions
  add constraint work_link_required check (
    num_nonnulls(instagram_handle, portfolio_url, headshot_url) >= 1
  );
