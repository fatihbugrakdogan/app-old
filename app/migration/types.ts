export interface Project {
  gid: string;
  name: string;
  owner: {
    gid: string;
    name: string;
  };
  permalink_url: string;
  migrating?: string; // Optional for compatibility with planning.tsx
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  isReady: boolean;
  accessTokenDocumentation: string;
  mapping: {
    [key: string]: { id: string; name: string; isPremium: boolean };
  };
} 