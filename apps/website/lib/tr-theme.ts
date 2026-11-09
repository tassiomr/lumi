/** Tema único dos apps TR Media no TR Design System (app/tr-tokens.css). */
export const trTheme = "luminousStudio";

export type TRMode = "light" | "dark" | "lightHighContrast" | "darkHighContrast";

/**
 * Define data-tr-mode no <html> antes da primeira pintura (sem flash) e acompanha mudanças do sistema,
 * a partir de prefers-color-scheme e prefers-contrast: more.
 */
export const trModeScript = `(function(){var d=document.documentElement,m=window.matchMedia,dk=m("(prefers-color-scheme: dark)"),hc=m("(prefers-contrast: more)");function u(){d.dataset.trMode=(dk.matches?"dark":"light")+(hc.matches?"HighContrast":"")}u();dk.addEventListener("change",u);hc.addEventListener("change",u)})()`;
