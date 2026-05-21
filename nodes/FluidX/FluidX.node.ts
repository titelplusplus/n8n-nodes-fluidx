import {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeApiError,
  NodeOperationError,
} from 'n8n-workflow';

type ResourceName = 'session' | 'inboundCall' | 'sms' | 'media';

export class FluidX implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'fluidX',
    name: 'fluidX',
    icon: 'file:fluidx.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the fluidX revXR THE EYE API (sessions, inbound calls, SMS, media).',
    defaults: { name: 'fluidX' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      { name: 'fluidXApi', required: true },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Session', value: 'session', description: 'Create, read, close THE EYE sessions' },
          { name: 'Inbound Call', value: 'inboundCall', description: 'Submit and track inbound call requests' },
          { name: 'SMS', value: 'sms', description: 'Send transactional SMS' },
          { name: 'Media', value: 'media', description: 'Read/upsert media info and session summaries' },
        ],
        default: 'session',
      },

      // ---------- Session ----------
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['session'] } },
        options: [
          { name: 'Create', value: 'create', action: 'Create a session', description: 'POST /api/fx/ext/session/create' },
          { name: 'Get', value: 'get', action: 'Get a session', description: 'GET /api/fx/ext/session' },
          { name: 'Get All', value: 'getAll', action: 'List sessions', description: 'GET /api/fx/ext/session/all' },
          { name: 'Close', value: 'close', action: 'Close a session', description: 'POST /api/fx/ext/session/close' },
          { name: 'Close All', value: 'closeAll', action: 'Close all sessions', description: 'POST /api/fx/ext/session/close/all' },
        ],
        default: 'create',
      },
      {
        displayName: 'Company',
        name: 'company',
        type: 'string',
        default: '',
        description: 'Business/Tenant company key.',
        displayOptions: { show: { resource: ['session'], operation: ['create'] } },
      },
      {
        displayName: 'Project',
        name: 'project',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['session'], operation: ['create'] } },
      },
      {
        displayName: 'Billing Code',
        name: 'billingCode',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['session'], operation: ['create'] } },
      },
      {
        displayName: 'Correlation ID',
        name: 'correlationId',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['session'], operation: ['create'] } },
      },
      {
        displayName: 'SKU',
        name: 'sku',
        type: 'options',
        options: [
          { name: 'THEEYE', value: 'THEEYE' },
          { name: 'THEEYEPLUS', value: 'THEEYEPLUS' },
          { name: 'THESTREAMER', value: 'THESTREAMER' },
        ],
        default: 'THEEYE',
        displayOptions: { show: { resource: ['session'], operation: ['create'] } },
      },

      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['session'], operation: ['get', 'close'] } },
      },

      {
        displayName: 'Status Filter',
        name: 'statusFilter',
        type: 'string',
        default: '',
        placeholder: 'ACTIVE,WAITING_FOR_USER',
        description: 'Comma-separated list of RevXRSessionStatus values to filter by. Leave empty for all.',
        displayOptions: { show: { resource: ['session'], operation: ['getAll'] } },
      },
      {
        displayName: 'Include All Users (Tenant Admin)',
        name: 'includeAll',
        type: 'boolean',
        default: false,
        description: 'Whether to return sessions for all users (requires Tenant Admin role).',
        displayOptions: { show: { resource: ['session'], operation: ['getAll'] } },
      },

      // ---------- Inbound Call ----------
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['inboundCall'] } },
        options: [
          { name: 'Create', value: 'create', action: 'Create an inbound call', description: 'POST /api/fx/ext/inbound/calls' },
          { name: 'Get', value: 'get', action: 'Get an inbound call', description: 'GET /api/fx/ext/inbound/calls/{id}' },
          { name: 'Cancel', value: 'cancel', action: 'Cancel an inbound call', description: 'POST /api/fx/ext/inbound/calls/{id}/cancel' },
          { name: 'End', value: 'end', action: 'End an inbound call', description: 'POST /api/fx/ext/inbound/calls/{id}/end' },
        ],
        default: 'create',
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'string',
        default: 'en',
        placeholder: 'ja',
        displayOptions: { show: { resource: ['inboundCall'], operation: ['create'] } },
      },
      {
        displayName: 'Fallback Languages',
        name: 'fallbackLanguages',
        type: 'string',
        default: '',
        placeholder: 'en,de',
        description: 'Comma-separated language codes.',
        displayOptions: { show: { resource: ['inboundCall'], operation: ['create'] } },
      },
      {
        displayName: 'External Ref',
        name: 'externalRef',
        type: 'string',
        default: '',
        placeholder: 'ticket-9842',
        displayOptions: { show: { resource: ['inboundCall'], operation: ['create'] } },
      },
      {
        displayName: 'Display Name',
        name: 'displayName',
        type: 'string',
        default: '',
        placeholder: 'Kiosk Lobby 3',
        displayOptions: { show: { resource: ['inboundCall'], operation: ['create'] } },
      },
      {
        displayName: 'Caller Phone Number',
        name: 'callerPhoneNumber',
        type: 'string',
        default: '',
        placeholder: '+49 30 12345678',
        displayOptions: { show: { resource: ['inboundCall'], operation: ['create'] } },
      },
      {
        displayName: 'Context (JSON)',
        name: 'context',
        type: 'json',
        default: '{}',
        description: 'Free-form key/value metadata shown to the agent (e.g. orderId, vip).',
        displayOptions: { show: { resource: ['inboundCall'], operation: ['create'] } },
      },

      {
        displayName: 'Call Request ID',
        name: 'callRequestId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['inboundCall'], operation: ['get', 'cancel', 'end'] } },
      },
      {
        displayName: 'Call Token',
        name: 'callToken',
        type: 'string',
        typeOptions: { password: true },
        default: '',
        required: true,
        description: 'The callToken returned by Create. Sent as the x-call-token header.',
        displayOptions: { show: { resource: ['inboundCall'], operation: ['get', 'cancel', 'end'] } },
      },

      // ---------- SMS ----------
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['sms'] } },
        options: [
          { name: 'Send', value: 'send', action: 'Send an SMS', description: 'POST /api/fx/ext/sms/send' },
        ],
        default: 'send',
      },
      {
        displayName: 'Phone Number',
        name: 'phoneNumber',
        type: 'string',
        default: '',
        required: true,
        placeholder: '+4912345678',
        displayOptions: { show: { resource: ['sms'], operation: ['send'] } },
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        typeOptions: { rows: 3 },
        default: '',
        required: true,
        displayOptions: { show: { resource: ['sms'], operation: ['send'] } },
      },
      {
        displayName: 'Session ID',
        name: 'smsSessionId',
        type: 'string',
        default: '',
        description: 'Associated session ID. Required by the SMS endpoint to charge against the right session.',
        displayOptions: { show: { resource: ['sms'], operation: ['send'] } },
      },

      // ---------- Media ----------
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['media'] } },
        options: [
          { name: 'Get Info', value: 'getInfo', action: 'Get media info', description: 'GET /api/fx/ext/media/info' },
          { name: 'Upsert Info', value: 'upsertInfo', action: 'Upsert media info', description: 'POST /api/fx/ext/media/info' },
          { name: 'Get Summary', value: 'getSummary', action: 'Get session summary', description: 'GET /api/fx/ext/media/summary' },
        ],
        default: 'getInfo',
      },
      {
        displayName: 'Media Type',
        name: 'mediaType',
        type: 'options',
        options: [
          { name: 'Image', value: 'image' },
          { name: 'Video', value: 'video' },
          { name: 'Audio', value: 'audio' },
        ],
        default: 'image',
        displayOptions: { show: { resource: ['media'], operation: ['getInfo', 'upsertInfo'] } },
      },
      {
        displayName: 'Media ID',
        name: 'mediaId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['media'], operation: ['getInfo'] } },
      },
      {
        displayName: 'Title',
        name: 'mediaTitle',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['media'], operation: ['upsertInfo'] } },
      },
      {
        displayName: 'Description',
        name: 'mediaDescription',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        displayOptions: { show: { resource: ['media'], operation: ['upsertInfo'] } },
      },
      {
        displayName: 'Media ID (Upsert)',
        name: 'upsertMediaId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['media'], operation: ['upsertInfo'] } },
      },
      {
        displayName: 'Session ID',
        name: 'mediaSessionId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['media'], operation: ['getSummary'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('fluidXApi');
    const baseUrl = String(credentials.baseUrl || 'https://live.fluidx.digital').replace(/\/$/, '');

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as ResourceName;
        const operation = this.getNodeParameter('operation', i) as string;

        let method: IHttpRequestMethods = 'GET';
        let path = '';
        let body: Record<string, unknown> | undefined;
        let qs: Record<string, string | boolean | number> | undefined;
        const extraHeaders: Record<string, string> = {};

        if (resource === 'session') {
          if (operation === 'create') {
            method = 'POST';
            path = '/api/fx/ext/session/create';
            body = {
              sessionDetails: {
                company: this.getNodeParameter('company', i, '') as string,
                project: this.getNodeParameter('project', i, '') as string,
                billingcode: this.getNodeParameter('billingCode', i, '') as string,
                correlationId: this.getNodeParameter('correlationId', i, '') as string,
                sku: this.getNodeParameter('sku', i, 'THEEYE') as string,
              },
            };
          } else if (operation === 'get') {
            method = 'GET';
            path = '/api/fx/ext/session';
            qs = { sessionId: this.getNodeParameter('sessionId', i) as string };
          } else if (operation === 'close') {
            method = 'POST';
            path = '/api/fx/ext/session/close';
            body = { sessionId: this.getNodeParameter('sessionId', i) as string };
          } else if (operation === 'getAll') {
            method = 'GET';
            path = '/api/fx/ext/session/all';
            const statusFilter = (this.getNodeParameter('statusFilter', i, '') as string).trim();
            const includeAll = this.getNodeParameter('includeAll', i, false) as boolean;
            qs = {};
            if (statusFilter) qs.status = statusFilter;
            if (includeAll) qs.includeAll = true;
          } else if (operation === 'closeAll') {
            method = 'POST';
            path = '/api/fx/ext/session/close/all';
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown session operation: ${operation}`, { itemIndex: i });
          }
        } else if (resource === 'inboundCall') {
          if (operation === 'create') {
            method = 'POST';
            path = '/api/fx/ext/inbound/calls';
            const fallbackRaw = (this.getNodeParameter('fallbackLanguages', i, '') as string).trim();
            const fallbackLanguages = fallbackRaw
              ? fallbackRaw.split(',').map((s) => s.trim()).filter(Boolean)
              : [];
            const contextRaw = this.getNodeParameter('context', i, {}) as unknown;
            const context = parseJsonOrObject(contextRaw, this.getNode(), i);
            body = {
              language: this.getNodeParameter('language', i, '') as string,
              fallbackLanguages,
              externalRef: this.getNodeParameter('externalRef', i, '') as string,
              displayName: this.getNodeParameter('displayName', i, '') as string,
              phoneNumber: this.getNodeParameter('callerPhoneNumber', i, '') as string,
              context,
            };
          } else {
            const callRequestId = this.getNodeParameter('callRequestId', i) as string;
            const callToken = this.getNodeParameter('callToken', i) as string;
            extraHeaders['x-call-token'] = callToken;
            if (operation === 'get') {
              method = 'GET';
              path = `/api/fx/ext/inbound/calls/${encodeURIComponent(callRequestId)}`;
            } else if (operation === 'cancel') {
              method = 'POST';
              path = `/api/fx/ext/inbound/calls/${encodeURIComponent(callRequestId)}/cancel`;
            } else if (operation === 'end') {
              method = 'POST';
              path = `/api/fx/ext/inbound/calls/${encodeURIComponent(callRequestId)}/end`;
            } else {
              throw new NodeOperationError(this.getNode(), `Unknown inboundCall operation: ${operation}`, { itemIndex: i });
            }
          }
        } else if (resource === 'sms') {
          if (operation === 'send') {
            method = 'POST';
            path = '/api/fx/ext/sms/send';
            body = {
              phoneNumber: this.getNodeParameter('phoneNumber', i) as string,
              message: this.getNodeParameter('message', i) as string,
              sessionId: this.getNodeParameter('smsSessionId', i, '') as string,
            };
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown sms operation: ${operation}`, { itemIndex: i });
          }
        } else if (resource === 'media') {
          if (operation === 'getInfo') {
            method = 'GET';
            path = '/api/fx/ext/media/info';
            qs = {
              type: this.getNodeParameter('mediaType', i) as string,
              id: this.getNodeParameter('mediaId', i) as string,
            };
          } else if (operation === 'upsertInfo') {
            method = 'POST';
            path = '/api/fx/ext/media/info';
            body = {
              type: this.getNodeParameter('mediaType', i) as string,
              id: this.getNodeParameter('upsertMediaId', i) as string,
              title: this.getNodeParameter('mediaTitle', i, '') as string,
              description: this.getNodeParameter('mediaDescription', i, '') as string,
            };
          } else if (operation === 'getSummary') {
            method = 'GET';
            path = '/api/fx/ext/media/summary';
            qs = { sessionId: this.getNodeParameter('mediaSessionId', i) as string };
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown media operation: ${operation}`, { itemIndex: i });
          }
        } else {
          throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
        }

        const requestOptions: IHttpRequestOptions = {
          method,
          url: `${baseUrl}${path}`,
          headers: { 'Content-Type': 'application/json', ...extraHeaders },
          json: true,
        };
        if (qs && Object.keys(qs).length > 0) requestOptions.qs = qs;
        if (body !== undefined) requestOptions.body = body;

        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'fluidXApi',
          requestOptions,
        );

        if (Array.isArray(response)) {
          for (const entry of response) {
            returnData.push({ json: entry as IDataObject, pairedItem: { item: i } });
          }
        } else {
          returnData.push({
            json: (response ?? {}) as IDataObject,
            pairedItem: { item: i },
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        if ((error as { response?: unknown }).response) {
          throw new NodeApiError(this.getNode(), error as never, { itemIndex: i });
        }
        throw error;
      }
    }

    return [returnData];
  }
}

function parseJsonOrObject(
  raw: unknown,
  node: ReturnType<IExecuteFunctions['getNode']>,
  itemIndex: number,
): Record<string, unknown> {
  if (raw === null || raw === undefined || raw === '') return {};
  if (typeof raw === 'object') return raw as Record<string, unknown>;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      throw new NodeOperationError(node, 'Context must be valid JSON', { itemIndex });
    }
  }
  return {};
}
