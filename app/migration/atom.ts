import { atom } from "jotai";

export const sourceProviderAtom = atom<{
  id: string;
  accessTokenDocumentation: string | undefined;
  name: string;
}>({ id: "", accessTokenDocumentation: undefined, name: "" });

interface AccessToken {
  accessToken: string;
  isSaved: boolean;
  isDisabled: boolean;
}

interface Workspace {
  id: string;
  name: string;
}

interface UserMapping {
  source_email: string;
  target_email: string;
  "exists in target": string;
  migrating: string;
}

interface UserMappingRule {
  type: "domain_changed" | "domain_same" | "";
  source_domain?: string;
  target_domain?: string;
  isCustom?: boolean;
}

export const sourceAccessTokenAtom = atom<AccessToken>({
  accessToken: "",
  isSaved: false,
  isDisabled: false,
});

export const sourceWorkspaceAtom = atom<Workspace>({
  id: "",
  name: "",
});

export const targetProviderAtom = atom<string>("asana");

export const targetAccessTokenAtom = atom<AccessToken>({
  accessToken: "",
  isSaved: false,
  isDisabled: false,
});

export const targetWorkspaceAtom = atom<Workspace>({
  id: "",
  name: "",
});

export const userMappingRuleAtom = atom<UserMappingRule>({
  type: "",
  source_domain: "",
  target_domain: "",
});

export const userMappingsAtom = atom<UserMapping[]>([]);

// Migration configuration atoms
export const tenantAtom = atom<string>("");
export const runIdAtom = atom<string>("");

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

export const sourcesAtom = atom<Platform[]>([]);
