import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AcademicSettings {
  submissionGracePeriodMinutes: number;
  lateSubmissionPenaltyPercent: number;
  maxFileUploadSizeMB: number;
  allowedFileExtensions: string;
  defaultPassPercentage: number;
}

export interface SecuritySettings {
  refreshTokenValidityDays: number;
  forcePasswordResetOnFirstLogin: boolean;
  maxFailedLoginAttempts: number;
  allowSelfRegistration: boolean;
}

export interface NotificationSettings {
  deadlineReminderLeadHours: number;
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
  systemAnnouncementBanner: string;
}

export interface SystemSettingsState {
  academic: AcademicSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;

  updateAcademicSettings: (settings: Partial<AcademicSettings>) => void;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  resetToDefaults: () => void;
}

const defaultAcademicSettings: AcademicSettings = {
  submissionGracePeriodMinutes: 15,
  lateSubmissionPenaltyPercent: 5,
  maxFileUploadSizeMB: 25,
  allowedFileExtensions: ".pdf, .docx, .zip, .png, .jpg",
  defaultPassPercentage: 40,
};

const defaultSecuritySettings: SecuritySettings = {
  refreshTokenValidityDays: 7,
  forcePasswordResetOnFirstLogin: true,
  maxFailedLoginAttempts: 5,
  allowSelfRegistration: true,
};

const defaultNotificationSettings: NotificationSettings = {
  deadlineReminderLeadHours: 24,
  enableEmailNotifications: true,
  enableInAppNotifications: true,
  systemAnnouncementBanner: "",
};

export const useSettingsStore = create<SystemSettingsState>()(
  persist(
    (set) => ({
      academic: defaultAcademicSettings,
      security: defaultSecuritySettings,
      notifications: defaultNotificationSettings,

      updateAcademicSettings: (updated) =>
        set((state) => ({
          academic: { ...state.academic, ...updated },
        })),

      updateSecuritySettings: (updated) =>
        set((state) => ({
          security: { ...state.security, ...updated },
        })),

      updateNotificationSettings: (updated) =>
        set((state) => ({
          notifications: { ...state.notifications, ...updated },
        })),

      resetToDefaults: () =>
        set({
          academic: defaultAcademicSettings,
          security: defaultSecuritySettings,
          notifications: defaultNotificationSettings,
        }),
    }),
    {
      name: "paperpulse-system-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
