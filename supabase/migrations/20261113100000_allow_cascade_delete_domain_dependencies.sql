-- Exclusão em cascata das referências de ficha técnica, custo e precificação.
--
-- Decisão do responsável (2026-11-13): a lixeira deve excluir o registro e
-- aquilo que depende dele, em vez de barrar a operação. Antes, excluir um
-- insumo usado na ficha técnica de um produto devolvia "está em uso" e o
-- administrador precisava editar o produto antes de conseguir limpar o insumo.
--
-- Consequência aceita: o custo registrado (cost_snapshots) e as simulações de
-- precificação (pricing_simulations) ligados ao registro são removidos junto.
-- Quem precisa preservar o histórico deve usar a desativação lógica.

-- ---------------------------------------------------------------------------
-- Ficha técnica: o insumo e o kit saem da composição do produto
-- ---------------------------------------------------------------------------

alter table public.product_components
  drop constraint product_components_supply_id_fkey,
  add constraint product_components_supply_id_fkey
    foreign key (supply_id) references public.supplies(id) on delete cascade;

alter table public.product_components
  drop constraint product_components_component_product_id_fkey,
  add constraint product_components_component_product_id_fkey
    foreign key (component_product_id) references public.products(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- Custo registrado e simulações de precificação
-- ---------------------------------------------------------------------------

alter table public.cost_snapshots
  drop constraint cost_snapshots_product_id_fkey,
  add constraint cost_snapshots_product_id_fkey
    foreign key (product_id) references public.products(id) on delete cascade;

alter table public.pricing_simulations
  drop constraint pricing_simulations_product_id_fkey,
  add constraint pricing_simulations_product_id_fkey
    foreign key (product_id) references public.products(id) on delete cascade;

alter table public.pricing_simulations
  drop constraint pricing_simulations_channel_id_fkey,
  add constraint pricing_simulations_channel_id_fkey
    foreign key (channel_id) references public.sales_channels(id) on delete cascade;

alter table public.pricing_simulations
  drop constraint pricing_simulations_payment_method_id_fkey,
  add constraint pricing_simulations_payment_method_id_fkey
    foreign key (payment_method_id) references public.payment_methods(id) on delete cascade;

-- Necessário para o cascade do custo: sem ele, remover um produto que tem
-- custo registrado seria barrado pela simulação que aponta para o snapshot.
alter table public.pricing_simulations
  drop constraint pricing_simulations_cost_snapshot_id_fkey,
  add constraint pricing_simulations_cost_snapshot_id_fkey
    foreign key (cost_snapshot_id) references public.cost_snapshots(id) on delete cascade;
