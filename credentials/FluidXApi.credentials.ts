import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class FluidXApi implements ICredentialType {
  name = 'fluidXApi';
  displayName = 'fluidX API';
  documentationUrl = 'https://live.fluidx.digital/api/swagger.html';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://live.fluidx.digital',
      description: 'Root URL of the fluidX deployment (no trailing slash).',
      placeholder: 'https://live.fluidx.digital',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Sent as the x-api-key header on every request.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'x-api-key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/api/healthz',
      method: 'GET',
    },
  };
}
