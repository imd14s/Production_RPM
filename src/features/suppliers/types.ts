/**
 * Tipos dos fornecedores de insumos.
 * Documento e telefone vivem como dígitos; a máscara é preocupação da tela.
 * (Ver migration 20261102100000.)
 */

export type Supplier = {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  isActive: boolean;
  notes: string;
};

export type SupplierInput = {
  name: string;
  document: string;
  phone: string;
  email: string;
  notes: string;
};
