import type { UserRole } from "@/types/auth";

/**
 * Estrutura da navegação lateral.
 * `available: false` indica módulo planejado e ainda não implementado — nunca
 * deve virar link clicável (regra de não criar botão sem função).
 */
export type NavigationItem = {
  label: string;
  href: string;
  available: boolean;
  minimumRole?: UserRole;
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Início", href: "/home", available: true },
  {
    label: "Insumos",
    href: "/insumos",
    available: true,
    minimumRole: "administrador",
  },
  {
    label: "Fornecedores",
    href: "/fornecedores",
    available: true,
    minimumRole: "administrador",
  },
  { label: "Produtos", href: "/produtos", available: false },
  { label: "Precificação", href: "/precificacao", available: false },
  { label: "Produção", href: "/producao", available: false },
  { label: "Estoque", href: "/estoque", available: false },
  { label: "Despesas", href: "/despesas", available: false },
  { label: "Relatórios", href: "/relatorios", available: false },
  {
    label: "Configurações",
    href: "/configuracoes",
    available: true,
    minimumRole: "administrador",
  },
];

/**
 * Informa se um item está visível para o perfil informado.
 *
 * @param item item de navegação
 * @param role perfil do usuário autenticado
 * @returns true quando o item pode aparecer no menu
 */
export function canSeeItem(item: NavigationItem, role: UserRole): boolean {
  if (!item.minimumRole) {
    return true;
  }

  return role === "administrador" && item.minimumRole === "administrador";
}

/**
 * Monta o menu do usuário: itens visíveis, separando disponíveis de planejados.
 *
 * @param role perfil do usuário autenticado
 * @returns listas de itens disponíveis e planejados
 */
export function buildNavigation(role: UserRole): {
  available: NavigationItem[];
  planned: NavigationItem[];
} {
  const visible = NAVIGATION_ITEMS.filter((item) => canSeeItem(item, role));

  return {
    available: visible.filter((item) => item.available),
    planned: visible.filter((item) => !item.available),
  };
}

/**
 * Verifica se o item corresponde à rota atual.
 *
 * @param href destino do item
 * @param pathname rota atual
 * @returns true quando é a rota atual (ou uma subrota dela)
 */
export function isActiveRoute(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Informa quantos módulos já estão disponíveis.
 *
 * @param role perfil do usuário
 * @returns quantidade de módulos disponíveis
 */
export function countAvailableModules(role: UserRole): number {
  return buildNavigation(role).available.length;
}
