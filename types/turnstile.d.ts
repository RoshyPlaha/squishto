export {};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          size?: "invisible" | "normal" | "compact";
          callback: (token: string) => void;
        },
      ) => string;
    };
  }
}
