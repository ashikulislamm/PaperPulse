import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: string[];
  permissions?: string[];
  mustChangePassword: boolean;
  tenantId?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isSidebarOpen: boolean;
  activeTenantId: string | null;

  setAuth: (user: UserProfile, token: string, refreshToken: string) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveTenantId: (tenantId: string) => void;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isSidebarOpen: true,
      activeTenantId: null,

      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          activeTenantId: user.tenantId || null,
        });
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          activeTenantId: null,
        });
      },

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      setActiveTenantId: (tenantId) => set({ activeTenantId: tenantId }),

      hasPermission: (permissionCode) => {
        const { user } = get();
        if (!user) return false;
        if (user.roles?.includes("Admin")) return true;
        return user.permissions?.includes(permissionCode) ?? false;
      },

      hasRole: (roleName) => {
        const { user } = get();
        if (!user) return false;
        return user.roles?.includes(roleName) ?? false;
      },
    }),
    {
      name: "paperpulse-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isSidebarOpen: state.isSidebarOpen,
        activeTenantId: state.activeTenantId,
      }),
    }
  )
);
