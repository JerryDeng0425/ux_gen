export const scenarioSchema = {
  $id: 'https://local.invalid/schemas/launch-config.json',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'version', 'startUrl'],
  properties: {
    id: { type: 'string', minLength: 1, pattern: '^[a-z0-9][a-z0-9-]*$' },
    version: { type: 'string', minLength: 1 },
    startUrl: { type: 'string', format: 'uri' },
    captureMode: { enum: ['exact', 'settled'] },
    hotkey: { type: 'string', minLength: 1 },
    outputDir: { type: 'string', minLength: 1 },
    captureButton: { type: 'boolean' }
  }
} as const;
