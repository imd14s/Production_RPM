/**
 * Estado devolvido pelas Server Actions de configurações.
 * Fica fora do arquivo "use server" porque módulos de ação só exportam funções.
 */
export type SettingsFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: Record<string, string>;
};

export const EMPTY_SETTINGS_STATE: SettingsFormState = {
  status: "idle",
  message: "",
  errors: {},
};
