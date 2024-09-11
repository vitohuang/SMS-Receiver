export interface Env {
  SMS_STORE: KVNamespace;
}

interface SMSMessage {
  sender: string;
  message: string;
  timestamp: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/messages' && request.method === 'GET') {
      return handleGetMessages(request, env);
    } else if (url.pathname === '/test-connection' && request.method === 'POST') {
      return handleTestConnection(request);
    } else if (request.method === 'POST') {
      return handlePostMessage(request, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function handlePostMessage(request: Request, env: Env): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { sender, message } = await request.json() as Partial<SMSMessage>;

    if (!sender || !message) {
      return new Response('Bad Request: Missing sender or message', { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const key = `${timestamp}-${sender}`;
    const value: SMSMessage = { sender, message, timestamp };

    await env.SMS_STORE.put(key, JSON.stringify(value));

    return new Response('Message stored successfully', { status: 200 });
  } catch (error) {
    return new Response('Bad Request: Invalid JSON', { status: 400 });
  }
}

async function handleGetMessages(request: Request, env: Env): Promise<Response> {
  if (!isAuthenticatedAdmin(request)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="SMS Messages"' }
    });
  }

  const messages: SMSMessage[] = [];
  const { keys } = await env.SMS_STORE.list();

  for (const key of keys) {
    const value = await env.SMS_STORE.get(key.name);
    if (value) {
      messages.push(JSON.parse(value) as SMSMessage);
    }
  }

  messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return new Response(JSON.stringify(messages, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleTestConnection(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  return new Response('Connection successful', { status: 200 });
}

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  return token === 'NWhqUsfvdyccGXNLBaGXRMwWNg9QgF3aKH5VRLg3k';
}

function isAuthenticatedAdmin(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const encodedCredentials = authHeader.split(' ')[1];
  const decodedCredentials = atob(encodedCredentials);
  const [username, password] = decodedCredentials.split(':');

  return username === 'admin' && password === 'randomlyGeneratedPassword';
}
