/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useAPIClient, useCurrentUserContext, useSystemSettings } from '@nocobase/client';
import { error } from '@nocobase/utils/client';
import { useCallback } from 'react';

export function useUpdateThemeSettings() {
  const api = useAPIClient();
  const currentUser = useCurrentUserContext();
  const systemSettings = useSystemSettings();

  const updateUserThemeSettings = useCallback(
    async (themeId: number | null) => {
      if (themeId === currentUser.data.data.systemSettings?.themeId) {
        return;
      }
      try {
        await api.resource('users').updateProfile({
          values: {
            systemSettings: {
              ...(currentUser.data.data.systemSettings || {}),
              themeId,
            },
          },
        });
        currentUser.mutate({
          data: {
            ...currentUser.data.data,
            systemSettings: {
              ...(currentUser.data.data.systemSettings || {}),
              themeId,
            },
          },
        });
      } catch (err) {
        error(err);
      }
    },
    [api, currentUser],
  );

  return { updateUserThemeSettings };
}
