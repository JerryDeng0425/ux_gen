export const scenarioSchema = {
  $id: 'https://local.invalid/schemas/scenario.json',
  type: 'object',
  additionalProperties: false,
  required: ['id', 'version', 'startUrl', 'keypoints'],
  properties: {
    id: { type: 'string', minLength: 1, pattern: '^[a-z0-9][a-z0-9-]*$' },
    version: { type: 'string', minLength: 1 },
    startUrl: { type: 'string', format: 'uri' },
    captureMode: { enum: ['exact', 'settled'] },
    hotkey: { type: 'string', minLength: 1 },
    outputDir: { type: 'string', minLength: 1 },
    redactSelectors: { type: 'array', items: { type: 'string', minLength: 1 }, uniqueItems: true },
    keypoints: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'instruction'],
        properties: {
          id: { type: 'string', pattern: '^K[0-9]{2,}$' },
          name: { type: 'string', minLength: 1 },
          instruction: { type: 'string', minLength: 1 },
          assertions: {
            type: 'array',
            items: {
              oneOf: [
                { type: 'object', additionalProperties: false, required: ['type', 'includes'], properties: { type: { const: 'url' }, includes: { type: 'string' } } },
                { type: 'object', additionalProperties: false, required: ['type', 'selector'], properties: { type: { const: 'exists' }, selector: { type: 'string' } } },
                { type: 'object', additionalProperties: false, required: ['type', 'selector', 'includes'], properties: { type: { const: 'text' }, selector: { type: 'string' }, includes: { type: 'string' } } },
                { type: 'object', additionalProperties: false, required: ['type', 'selector', 'name', 'equals'], properties: { type: { const: 'attribute' }, selector: { type: 'string' }, name: { type: 'string' }, equals: { type: 'string' } } },
                { type: 'object', additionalProperties: false, required: ['type', 'selector', 'equals'], properties: { type: { const: 'value' }, selector: { type: 'string' }, equals: { type: 'string' } } },
                { type: 'object', additionalProperties: false, required: ['type', 'selector', 'equals'], properties: { type: { const: 'checked' }, selector: { type: 'string' }, equals: { type: 'boolean' } } }
              ]
            }
          },
          maskSelectors: { type: 'array', items: { type: 'string' }, uniqueItems: true },
          redactSelectors: { type: 'array', items: { type: 'string' }, uniqueItems: true }
        }
      }
    }
  }
} as const;
