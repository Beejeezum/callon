begin;

insert into public.categories(slug, label, default_risk_level, sort_order) values
  ('basic-tools','Basic tools','low',10),
  ('ladders','Ladders','moderate',20),
  ('yard-equipment','Yard equipment','moderate',30),
  ('party-events','Party & event gear','low',40),
  ('tables-chairs','Tables & chairs','low',50),
  ('camping','Camping gear','low',60),
  ('kitchen','Kitchen equipment','low',70),
  ('kids','Kids gear','moderate',80),
  ('transportation','Transportation help','moderate',90),
  ('diy-guidance','DIY guidance','moderate',100),
  ('gardening','Gardening knowledge','low',110),
  ('event-help','Event setup help','low',120),
  ('power-saws','Power saws','restricted',900),
  ('chainsaws','Chainsaws','prohibited',910),
  ('firearms','Firearms and weapons','prohibited',920),
  ('medication','Medication','prohibited',930)
on conflict (slug) do update set label=excluded.label, default_risk_level=excluded.default_risk_level, sort_order=excluded.sort_order;

commit;
