-- Configurações de rateio e margens padrão para precificação.
--
-- Como o sistema não controla produção real, o volume mensal estimado
-- permite ratear despesas operacionais por unidade. As margens padrão
-- alimentam a matriz automática de preços da home.

alter table public.company_settings
  add column monthly_output_units integer
    check (monthly_output_units is null or monthly_output_units > 0),
  add column default_retail_margin numeric(9, 6)
    check (default_retail_margin is null or (default_retail_margin >= 0 and default_retail_margin <= 100)),
  add column default_wholesale_margin numeric(9, 6)
    check (default_wholesale_margin is null or (default_wholesale_margin >= 0 and default_wholesale_margin <= 100));