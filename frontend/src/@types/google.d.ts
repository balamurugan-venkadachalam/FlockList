interface GoogleAccount {
  id: {
    initialize: (config: { client_id: string; callback: (response: any) => void }) => void;
    renderButton: (element: HTMLElement, options: { theme: string; size: string; width: string }) => void;
  };
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccount;
    };
  }
} 