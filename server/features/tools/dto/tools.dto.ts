import { createIntegrationsToolsValidation } from '../../integrations/dto/integrations.dto'

// Kontrak tool dipakai bersama dengan pendaftarannya di bawah integration;
// yang berbeda hanya rutenya.
export const updateToolsValidation = createIntegrationsToolsValidation

export type UpdateToolsDto = typeof updateToolsValidation._output
