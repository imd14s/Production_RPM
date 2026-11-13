-- Valores base de mercado (conferidos em 2026-11-03) para iniciar o cálculo real.
--
-- Corrige o estado anterior (Mercado Livre com 8% único; imposto ICMS 3% por
-- venda, que não existe para MEI; maquininha com taxa única de 5%) e cria os
-- canais faltantes com as taxas pesquisadas.
--
-- Estratégia: idempotente — nada é excluído fisicamente; linhas substituídas
-- ficam inativas com nota explicando a substituição. Cada inserção só ocorre
-- quando a etiqueta ainda não existe para o canal/meio.
--
-- Fontes conferidas em 11/2026:
--   Mercado Livre — Central de Vendedores (comissão Clássico 10–14% por
--     categoria; Premium +5 p.p.; tarifa por unidade para itens < R$ 79).
--   TikTok Shop — Tarifa de Comissão da Plataforma (vigor desde 15/07/2026:
--     < R$ 50 → 10% + R$ 4,00/item; ≥ R$ 50 → 6% + R$ 6,00/item; Programa de
--     Taxas de Envio +6% com teto de R$ 50, adesão automática).
--   Mercado Pago — tabela oficial de taxas e tarifas (Pix online 0,99%; crédito
--     à vista D0 4,98%; Point: Pix 0,49%, débito 1,99%, crédito à vista 4,98%).
--   MEI — Simples Nacional (Decreto 12.797/2025, salário mínimo R$ 1.621,00):
--     DAS mensal comércio/indústria R$ 82,05 (INSS R$ 81,05 + ICMS R$ 1,00).

begin;

-- ---------------------------------------------------------------------------
-- 1. Impostos: MEI não recolhe imposto por venda — ICMS 3% sai de circulação
-- ---------------------------------------------------------------------------

update public.tax_settings
set is_active = false,
    notes = left(
      coalesce(notes, '')
      || 'MEI recolhe o DAS fixo mensal (cadastrado em Despesas), não ICMS por venda. Pesquisa de 11/2026.',
      500
    )
where is_active
  and lower(btrim(name)) = 'icms'
  and kind = 'percentual';

-- ---------------------------------------------------------------------------
-- 2. Mercado Livre: comissão Clássico por categoria + tarifa por unidade
-- ---------------------------------------------------------------------------

update public.sales_channels
set kind = 'marketplace'
where lower(btrim(name)) = 'mercado livre'
  and kind is distinct from 'marketplace';

-- Acrescenta a justificativa às taxas antigas de 8% e as desativa.
update public.channel_fees
set is_active = false,
    notes = left(
      coalesce(notes, '')
      || 'Substituída pela pesquisa de 11/2026: comissão por categoria (10–14% Clássico) + tarifa por unidade.',
      500
    )
where is_active
  and rate = 8
  and channel_id in (select id from public.sales_channels where lower(btrim(name)) = 'mercado livre');

insert into public.channel_fees (channel_id, label, kind, rate, notes)
select channel.id,
       'Comissão (anúncio Clássico)',
       'percentual',
       12,
       'Clássico: 10—14% conforme a categoria (casa e decoração 12—14%; beleza 14%; artesanato 11,5%). Premium: +5 p.p. Confirmar no painel do canal. Pesquisa 11/2026.'
from public.sales_channels channel
where lower(btrim(channel.name)) = 'mercado livre'
  and not exists (
    select 1
    from public.channel_fees fee
    where fee.channel_id = channel.id
      and lower(btrim(fee.label)) = lower('Comissão (anúncio Clássico)')
  );

insert into public.channel_fees (channel_id, label, kind, amount_cents, notes)
select channel.id,
       'Tarifa por unidade (itens < R$ 79)',
       'fixo',
       600,
       'R$ 5,50 até R$ 19,99; R$ 6,00 de R$ 20 a R$ 78,99; 50% do valor abaixo de R$ 12,50; nenhuma a partir de R$ 79. Pesquisa 11/2026.'
from public.sales_channels channel
where lower(btrim(channel.name)) = 'mercado livre'
  and not exists (
    select 1
    from public.channel_fees fee
    where fee.channel_id = channel.id
      and lower(btrim(fee.label)) = lower('Tarifa por unidade (itens < R$ 79)')
  );

-- ---------------------------------------------------------------------------
-- 3. DAS-MEI como despesa operacional (rateia pelo volume mensal da empresa)
-- ---------------------------------------------------------------------------

insert into public.operating_expenses (name, amount_cents, notes)
select 'DAS-MEI — imposto mensal',
       8205,
       'INSS 5% do salário mínimo 2026 (R$ 1.621,00) = R$ 81,05 + ICMS R$ 1,00 (comércio/indústria). Valor fixo, vence dia 20, independente do faturamento. Fonte: Simples Nacional, Decreto 12.797/2025.'
where not exists (
  select 1
  from public.operating_expenses expense
  where lower(btrim(expense.name)) = lower('DAS-MEI — imposto mensal')
    and expense.is_active
);

-- ---------------------------------------------------------------------------
-- 4. Canais novos com taxas base
-- ---------------------------------------------------------------------------

insert into public.sales_channels (name, kind, notes)
select 'TikTok Shop', 'marketplace',
       'Taxas em vigor desde 15/07/2026. Fonte: Tarifa de Comissão da Plataforma (TikTok Shop).'
where not exists (
  select 1 from public.sales_channels where lower(btrim(name)) = lower('TikTok Shop')
);

insert into public.sales_channels (name, kind, notes)
select 'Site próprio', 'site_proprio',
       'Venda pela loja virtual; recebimento via Mercado Pago online (meios de pagamento).'
where not exists (
  select 1 from public.sales_channels where lower(btrim(name)) = lower('Site próprio')
);

insert into public.sales_channels (name, kind, notes)
select 'Loja física', 'loja_fisica',
       'Venda presencial com maquininha Mercado Pago Point; custo vem do meio de pagamento.'
where not exists (
  select 1 from public.sales_channels where lower(btrim(name)) = lower('Loja física')
);

insert into public.sales_channels (name, kind, notes)
select 'WhatsApp / Pix direto', 'whatsapp',
       'Combinação combinada por mensagem; recebimento via Pix direto na chave, sem taxa.'
where not exists (
  select 1 from public.sales_channels where lower(btrim(name)) = lower('WhatsApp / Pix direto')
);

insert into public.channel_fees (channel_id, label, kind, rate, notes)
select channel.id,
       'Comissão (itens < R$ 50)',
       'percentual',
       10,
       'Itens < R$ 50: 10% + R$ 4,00 por item. Itens ≥ R$ 50: 6% + R$ 6,00. Base: preço após desconto do vendedor. Programa de Taxas de Envio: +6% (teto R$ 50/item, adesão automática). Afiliados: opcional. Pesquisa 11/2026.'
from public.sales_channels channel
where lower(btrim(channel.name)) = lower('TikTok Shop')
  and not exists (
    select 1
    from public.channel_fees fee
    where fee.channel_id = channel.id
      and lower(btrim(fee.label)) = lower('Comissão (itens < R$ 50)')
  );

insert into public.channel_fees (channel_id, label, kind, amount_cents, notes)
select channel.id,
       'Tarifa por item (itens < R$ 50)',
       'fixo',
       400,
       'R$ 4,00 para itens abaixo de R$ 50; R$ 6,00 a partir de R$ 50 (ajustar a linha quando o produto subir de faixa). Pesquisa 11/2026.'
from public.sales_channels channel
where lower(btrim(channel.name)) = lower('TikTok Shop')
  and not exists (
    select 1
    from public.channel_fees fee
    where fee.channel_id = channel.id
      and lower(btrim(fee.label)) = lower('Tarifa por item (itens < R$ 50)')
  );

-- ---------------------------------------------------------------------------
-- 5. Meios de pagamento: Point desmembrado + Mercado Pago online + Pix direto
-- ---------------------------------------------------------------------------

insert into public.payment_methods (name, notes)
select 'Mercado Pago online',
       'Checkout Pro / Link de pagamento para o site próprio e vendas remotas. Tabela oficial vigente 2026.'
where not exists (
  select 1 from public.payment_methods where lower(btrim(name)) = lower('Mercado Pago online')
);

insert into public.payment_methods (name, notes)
select 'Pix direto (chave)',
       'Transferência direta na chave Pix: sem taxa de canal nem de recebimento.'
where not exists (
  select 1 from public.payment_methods where lower(btrim(name)) = lower('Pix direto (chave)')
);

-- Taxa única de 5% da maquininha sai de circulação com a nota da substituição.
update public.payment_fees
set is_active = false,
    notes = left(
      coalesce(notes, '')
      || 'Substituída pelas taxas separadas do Mercado Pago Point (pesquisa 11/2026): Pix 0,49%; débito 1,99%; crédito à vista 4,98%.',
      500
    )
where is_active
  and rate = 5
  and method_id in (select id from public.payment_methods where lower(btrim(name)) = 'maquininha');

insert into public.payment_fees (method_id, label, kind, rate, notes)
select method.id,
       'Pix',
       'percentual',
       0.49,
       'Tarifa do Pix na maquininha/QR Mercado Pago Point. Pesquisa 11/2026.'
from public.payment_methods method
where lower(btrim(method.name)) = 'maquininha'
  and not exists (
    select 1
    from public.payment_fees fee
    where fee.method_id = method.id
      and lower(btrim(fee.label)) = 'Pix'
  );

insert into public.payment_fees (method_id, label, kind, rate, installments, notes)
select method.id,
       'Débito à vista',
       'percentual',
       1.99,
       1,
       'Faixa inicial (até R$ 3 mil/mês); cai até 1,25% com faturamento maior. Pesquisa 11/2026.'
from public.payment_methods method
where lower(btrim(method.name)) = 'maquininha'
  and not exists (
    select 1
    from public.payment_fees fee
    where fee.method_id = method.id
      and lower(btrim(fee.label)) = 'Débito à vista'
  );

insert into public.payment_fees (method_id, label, kind, rate, installments, notes)
select method.id,
       'Crédito à vista',
       'percentual',
       4.98,
       1,
       'Recebimento na hora; varia 3,08—4,98% conforme faturamento e prazo. Pesquisa 11/2026.'
from public.payment_methods method
where lower(btrim(method.name)) = 'maquininha'
  and not exists (
    select 1
    from public.payment_fees fee
    where fee.method_id = method.id
      and lower(btrim(fee.label)) = 'Crédito à vista'
  );

insert into public.payment_fees (method_id, label, kind, rate, installments, notes)
select method.id,
       'Pix',
       'percentual',
       0.99,
       null,
       'Pesquisa 11/2026.'
from public.payment_methods method
where lower(btrim(method.name)) = 'mercado pago online'
  and not exists (
    select 1
    from public.payment_fees fee
    where fee.method_id = method.id
      and lower(btrim(fee.label)) = 'Pix'
  );

insert into public.payment_fees (method_id, label, kind, rate, installments, notes)
select method.id,
       'Crédito à vista (D0)',
       'percentual',
       4.98,
       1,
       'Recebimento na hora; 3,98% recebendo em 30 dias; boleto custa R$ 3,49 fixo. Pesquisa 11/2026.'
from public.payment_methods method
where lower(btrim(method.name)) = 'mercado pago online'
  and not exists (
    select 1
    from public.payment_fees fee
    where fee.method_id = method.id
      and lower(btrim(fee.label)) = 'Crédito à vista (D0)'
  );

commit;
