import { Ai } from './vendor/@cloudflare/ai.js';

export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    if (request.method !== "GET" || !searchParams.has("prompt")) {
      console.warn("Rejecting malformed request");
      return new Response(null, {
        status: 422,
        statusText: "no prompt given"
      });
    }

    const ai = new Ai(env.AI);

    const response = await ai.run(
      '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      {
        prompt: searchParams.get("prompt")
      }
    );

    console.log(`Generated ${response.length} bytes of PNG for prompt "${searchParams.get("prompt")}"`);

    return new Response(response, {
      headers: {
        'content-type': 'image/png'
      }
    });
  }
};
