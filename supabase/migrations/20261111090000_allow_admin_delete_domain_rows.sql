-- Exclusão física (lixeira) de registros de configuração e cadastro.
--
-- Decisão de produto (2026-11-11): o administrador pode excluir permanentemente
-- taxas, canais, meios, impostos, despesas, mão de obra, fornecedores, insumos e
-- produtos quando não houver referência que impeça o DELETE (histórico ou
-- composição). `company_settings` permanece sem DELETE (linha única).
--
-- FKs com RESTRICT (simulações, snapshots, composições) continuam bloqueando
-- a exclusão no banco; a aplicação traduz o erro 23503 em mensagem amigável.
-- Cascades (taxas filhas, componentes de ficha, conversões) exigem policy de
-- DELETE nas tabelas referenciadas.

-- ---------------------------------------------------------------------------
-- Canais de venda e taxas
-- ---------------------------------------------------------------------------

create policy "sales_channels_delete_admin"
  on public.sales_channels
  for delete
  to authenticated
  using (public.is_admin());

create policy "channel_fees_delete_admin"
  on public.channel_fees
  for delete
  to authenticated
  using (public.is_admin());

grant delete on public.sales_channels to authenticated;
grant delete on public.channel_fees to authenticated;

-- ---------------------------------------------------------------------------
-- Meios de pagamento e taxas
-- ---------------------------------------------------------------------------

create policy "payment_methods_delete_admin"
  on public.payment_methods
  for delete
  to authenticated
  using (public.is_admin());

create policy "payment_fees_delete_admin"
  on public.payment_fees
  for delete
  to authenticated
  using (public.is_admin());

grant delete on public.payment_methods to authenticated;
grant delete on public.payment_fees to authenticated;

-- ---------------------------------------------------------------------------
-- Impostos, despesas e mão de obra
-- ---------------------------------------------------------------------------

create policy "tax_settings_delete_admin"
  on public.tax_settings
  for delete
  to authenticated
  using (public.is_admin());

create policy "operating_expenses_delete_admin"
  on public.operating_expenses
  for delete
  to authenticated
  using (public.is_admin());

create policy "labor_costs_delete_admin"
  on public.labor_costs
  for delete
  to authenticated
  using (public.is_admin());

grant delete on public.tax_settings to authenticated;
grant delete on public.operating_expenses to authenticated;
grant delete on public.labor_costs to authenticated;

-- ---------------------------------------------------------------------------
-- Fornecedores e insumos
-- ---------------------------------------------------------------------------

create policy "suppliers_delete_admin"
  on public.suppliers
  for delete
  to authenticated
  using (public.is_admin());

create policy "supplies_delete_admin"
  on public.supplies
  for delete
  to authenticated
  using (public.is_admin());

create policy "supply_unit_conversions_delete_admin"
  on public.supply_unit_conversions
  for delete
  to authenticated
  using (public.is_admin());

grant delete on public.suppliers to authenticated;
grant delete on public.supplies to authenticated;
grant delete on public.supply_unit_conversions to authenticated;

-- ---------------------------------------------------------------------------
-- Produtos (product_components já possui policy de DELETE)
-- ---------------------------------------------------------------------------

create policy "products_delete_admin"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

grant delete on public.products to authenticated;
