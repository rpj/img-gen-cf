import { Ai } from './vendor/@cloudflare/ai.js';

const DEFAULT_MODEL = '@cf/stabilityai/stable-diffusion-xl-base-1.0';

export default {
  async fetch(request, env) {
    const ai = new Ai(env.AI);
    const { searchParams } = new URL(request.url);
    if (request.method !== 'GET' || !searchParams.has('prompt') || !searchParams.has('t')) {
      console.warn('Rejecting malformed request');
      return new Response(null, { status: 422 });
    }

    const allowed = JSON.parse(await env.KVStore.get(env.TOKENS_LIST_KVSTORE_KEY_NAME));
    if (!allowed.includes(searchParams.get('t'))) {
      console.warn(`Rejecting invalid token '${searchParams.get('t')}'`);
      return new Response(null, { status: 401 });
    }

    const modelName = await env.KVStore.get(env.MODEL_NAME_KVSTORE_KEY_NAME) ?? DEFAULT_MODEL;
    console.log(`Prompting ${modelName} with '${searchParams.get('prompt')}' (token: ${searchParams.get('t')})`);
    const response = await ai.run(modelName, { prompt: searchParams.get('prompt') });
    console.log(`Generated ${response.length} bytes of PNG for prompt '${searchParams.get('prompt')}'`);

    return new Response(response, {
      headers: { 'content-type': 'image/png' }
    });
  }
};
