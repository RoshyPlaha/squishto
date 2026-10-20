export {};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          size?: "normal" | "compact" | "flexible";
          callback: (token: string) => void;
        },
      ) => string;
    };
  }
}
