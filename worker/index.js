/**
 * Coleta própria da IXC — server-side sem plataforma externa.
 *
 * Roda no MESMO Worker que já serve a landing page, então o endpoint fica na
 * MESMA ORIGEM da página:
 *
 *     https://lps.ixcprovedor.com.br/api/collect
 *
 * Por que isto é melhor que o subdomínio da Stape, e não apenas equivalente:
 *
 *   1. Mesma origem, não subdomínio. Bloqueadores e o ITP tratam subdomínio de
 *      coleta de forma diferente do domínio da página; `/api/collect` é
 *      indistinguível de uma chamada da própria aplicação.
 *   2. Nenhum terceiro vê o dado. A Stape deixa de ser operadora de dados
 *      pessoais (LGPD), e não há DPA a manter.
 *   3. Nenhum uptime novo. Se a LP está no ar, o endpoint está no ar.
 *   4. Deploy junto com a LP, no mesmo repositório e no mesmo PR.
 *
 * Segredos são *secrets* do Worker, nunca código:
 *     wrangler secret put META_CAPI_TOKEN
 *     wrangler secret put COLLECT_SHARED_SECRET
 *     wrangler secret put GA4_API_SECRET          (opcional, ver GA4 abaixo)
 *
 * O QUE ESTE WORKER **NÃO** FAZ, DE PROPÓSITO
 * -------------------------------------------
 * Não manda evento de navegação para o GA4 pelo Measurement Protocol. O GA4 não
 * desduplica por `event_id` — mandar `page_view` pelo gtag e pelo MP resulta em
 * dois eventos, não em um evento resistente a bloqueador. O MP aqui é reservado
 * a eventos que **não existem no navegador**: a qualificação do lead (MQL) que o
 * n8n devolve do HubSpot. Esse é o único caso em que o MP não duplica nada.
 *
 * Google Ads também não sai daqui: a conversão imediata vem da tag do container
 * web (que agora existe) e a conversão de MQL vem do n8n, que já tem o fluxo de
 * OAuth e Enhanced Conversions montado. Implementar aqui seria uma terceira via
 * para o mesmo número — dupla contagem.
 */

const META_API_VERSION = 'v21.0';
const META_PIXEL_ID = '302105624380206';
const GA4_MEASUREMENT_ID = 'G-V612GJ6TWY';

/** Origens autorizadas a chamar a coleta. Nada de `*`. */
const ORIGENS_OK = [
  'https://lps.ixcprovedor.com.br',
];

/** page_view → PageView, etc. Nome canônico do tracking plan → nome do Meta. */
const EVENTO_META = {
  page_view: 'PageView',
  generate_lead: 'Lead',
  whatsapp_click: 'Contact',
  mql: 'Lead',
};

/** Eventos que a coleta própria aceita. Qualquer outro é descartado. */
const EVENTOS_ACEITOS = Object.keys(EVENTO_META);

// --------------------------------------------------------------- utilidades

/** SHA-256 em hex, como Meta e Google exigem. */
async function sha256(texto) {
  const bytes = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function textoNormalizado(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim().toLowerCase();
  return s || null;
}

/**
 * Telefone para o Meta: somente dígitos, COM código do país e SEM '+'.
 *
 * O Google quer o oposto (E.164, com '+'). É por isso que a normalização não
 * pode acontecer no navegador: um hash único para os dois derruba o match rate
 * de um dos lados, e o erro é silencioso — a plataforma só reporta "não casou".
 */
function telefoneMeta(v) {
  if (!v) return null;
  let d = String(v).replace(/\D/g, '');
  if (d.length < 10) return null;
  if (d.length <= 11) d = '55' + d; // sem DDI → assume Brasil
  return d;
}

/** Hash só do que é identificador pessoal. IP, user agent, fbp e fbc vão em claro — o Meta exige. */
async function montarUserData(payload, request) {
  const ud = {};
  const u = payload.user_data || {};

  const email = textoNormalizado(u.email);
  if (email) ud.em = [await sha256(email)];

  const fone = telefoneMeta(u.phone);
  if (fone) ud.ph = [await sha256(fone)];

  const nome = textoNormalizado(u.first_name);
  if (nome) ud.fn = [await sha256(nome)];

  const sobrenome = textoNormalizado(u.last_name);
  if (sobrenome) ud.ln = [await sha256(sobrenome)];

  const pais = textoNormalizado(u.country);
  if (pais) ud.country = [await sha256(pais)];

  const id = payload.identity || {};
  if (id.client_id) ud.external_id = [await sha256(String(id.client_id))];
  if (id.fbp) ud.fbp = String(id.fbp);
  if (id.fbc) ud.fbc = String(id.fbc);

  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For');
  if (ip) ud.client_ip_address = ip.split(',')[0].trim();

  const ua = request.headers.get('User-Agent');
  if (ua) ud.client_user_agent = ua;

  return ud;
}

// ------------------------------------------------------------------ destinos

async function enviarMetaCapi(payload, request, env) {
  if (!env.META_CAPI_TOKEN) {
    return { destino: 'meta', ok: false, motivo: 'META_CAPI_TOKEN ausente' };
  }

  // Consentimento de marketing negado → não envia. Consent antes de tag (regra 8).
  if (payload.consent && payload.consent.ad === 'denied') {
    return { destino: 'meta', ok: true, motivo: 'consentimento de marketing negado' };
  }

  const atrib = payload.attribution || {};
  const evento = {
    event_name: EVENTO_META[payload.event_name],
    event_time: payload.event_time || Math.floor(Date.now() / 1000),
    // A chave da deduplicação: o MESMO id que o Meta Pixel usou no navegador.
    event_id: payload.event_id,
    event_source_url: (payload.page && payload.page.location) || undefined,
    action_source: payload.action_source || 'website',
    user_data: await montarUserData(payload, request),
    custom_data: {
      utm_source: atrib.utm_source,
      utm_medium: atrib.utm_medium,
      utm_campaign: atrib.utm_campaign,
      utm_content: atrib.utm_content,
      utm_term: atrib.utm_term,
      ad_id: atrib.ad_id,
      page_referrer: (payload.page && payload.page.referrer) || undefined,
    },
  };

  const corpo = { data: [evento] };
  if (env.META_TEST_EVENT_CODE) corpo.test_event_code = env.META_TEST_EVENT_CODE;

  const url =
    `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events` +
    `?access_token=${encodeURIComponent(env.META_CAPI_TOKEN)}`;

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });

  const texto = await r.text();
  return {
    destino: 'meta',
    ok: r.ok,
    status: r.status,
    // A resposta do Meta não contém PII — é contagem e código de erro.
    resposta: r.ok ? undefined : texto.slice(0, 400),
  };
}

/**
 * GA4 via Measurement Protocol.
 *
 * Só para eventos que não existem no navegador (hoje: `mql`, vindo do n8n).
 * Chamar isto para `page_view` duplicaria o evento — o GA4 não desduplica.
 */
async function enviarGa4(payload, env) {
  if (!env.GA4_API_SECRET) {
    return { destino: 'ga4', ok: false, motivo: 'GA4_API_SECRET ausente' };
  }
  const clientId = payload.identity && payload.identity.client_id;
  if (!clientId) {
    return { destino: 'ga4', ok: false, motivo: 'client_id ausente' };
  }

  const consent = payload.consent || {};
  const url =
    'https://www.google-analytics.com/mp/collect' +
    `?measurement_id=${GA4_MEASUREMENT_ID}` +
    `&api_secret=${encodeURIComponent(env.GA4_API_SECRET)}`;

  const atrib = payload.attribution || {};
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      consent: {
        ad_user_data: consent.ad === 'granted' ? 'GRANTED' : 'DENIED',
        ad_personalization: consent.ad === 'granted' ? 'GRANTED' : 'DENIED',
      },
      events: [
        {
          name: payload.event_name,
          params: {
            event_id: payload.event_id,
            source: atrib.utm_source,
            medium: atrib.utm_medium,
            campaign: atrib.utm_campaign,
            engagement_time_msec: 1,
          },
        },
      ],
    }),
  });

  // O MP responde 204 sem corpo mesmo quando descarta o evento por schema.
  // Validação real só pelo endpoint /debug/mp/collect.
  return { destino: 'ga4', ok: r.status === 204 || r.ok, status: r.status };
}

// -------------------------------------------------------------------- coleta

async function coletar(request, env, ctx) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cabecalhosCors(request) });
  }
  if (request.method !== 'POST') {
    return json({ erro: 'método não permitido' }, 405, request);
  }

  // Só a própria LP chama. Sem isto o endpoint é um relay aberto para o pixel.
  const origem = request.headers.get('Origin');
  const chave = request.headers.get('X-IXC-Key');
  const deServidor = Boolean(
    env.COLLECT_SHARED_SECRET && chave && chave === env.COLLECT_SHARED_SECRET
  );
  if (!deServidor && origem && !ORIGENS_OK.includes(origem)) {
    return json({ erro: 'origem não autorizada' }, 403, request);
  }

  let payload;
  try {
    const bruto = await request.text();
    if (bruto.length > 16 * 1024) {
      return json({ erro: 'payload grande demais' }, 413, request);
    }
    payload = JSON.parse(bruto);
  } catch (e) {
    return json({ erro: 'json inválido' }, 400, request);
  }

  if (!payload || !EVENTOS_ACEITOS.includes(payload.event_name)) {
    return json({ erro: 'event_name não aceito' }, 400, request);
  }
  if (!payload.event_id) {
    // Sem event_id não há deduplicação, e sem dedup a implementação não passa
    // na validação (regra 9). Recusar é melhor que contar duas vezes.
    return json({ erro: 'event_id obrigatório' }, 400, request);
  }

  // Identidade só é aceita de quem tem direito a mandá-la.
  const querGa4 = payload.event_name === 'mql';
  if (querGa4 && !deServidor) {
    return json({ erro: 'evento server-only exige X-IXC-Key' }, 403, request);
  }

  const tarefas = [enviarMetaCapi(payload, request, env)];
  if (querGa4) tarefas.push(enviarGa4(payload, env));

  // waitUntil: a resposta volta na hora e os envios terminam em segundo plano.
  // Importante no clique do WhatsApp, que troca de aplicativo em seguida.
  const promessa = Promise.all(tarefas);
  ctx.waitUntil(promessa);

  let resultados;
  try {
    resultados = await promessa;
  } catch (e) {
    resultados = [{ ok: false, motivo: 'falha no envio' }];
  }

  // Log sem PII: nome do evento, id e resultado. Nunca e-mail ou telefone.
  // A v1 usava logType=debug no container server, que escrevia PII no log.
  console.log(
    JSON.stringify({
      event_name: payload.event_name,
      event_id: payload.event_id,
      consent: payload.consent,
      resultados: resultados.map((r) => ({
        destino: r.destino,
        ok: r.ok,
        status: r.status,
        motivo: r.motivo,
      })),
    })
  );

  return json({ ok: true, event_id: payload.event_id, resultados }, 200, request);
}

// ------------------------------------------------------------------ resposta

function cabecalhosCors(request) {
  const origem = request.headers.get('Origin');
  const h = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-IXC-Key',
    'Access-Control-Max-Age': '86400',
  };
  if (origem && ORIGENS_OK.includes(origem)) {
    h['Access-Control-Allow-Origin'] = origem;
  }
  return h;
}

function json(corpo, status, request) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...cabecalhosCors(request),
    },
  });
}

/**
 * Caminhos que NUNCA devem ser servidos, mesmo que acabem publicados como asset.
 *
 * Em 2026-07-29 foi confirmado em produção que `/.git/config` e `/wrangler.jsonc`
 * respondiam 200 — o repositório inteiro estava público, porque `assets.directory`
 * é a raiz do projeto. O `.assetsignore` resolve na origem, mas depende de ser
 * respeitado no upload; esta lista é a segunda camada, que não depende disso.
 */
const BLOQUEADOS = [
  /^\/\.git(\/|$)/,
  /^\/worker(\/|$)/,
  /^\/\.assetsignore$/,
  /^\/\.gitignore$/,
  /^\/wrangler\.(jsonc?|toml)$/,
  /^\/package(-lock)?\.json$/,
  /^\/node_modules(\/|$)/,
  /^\/\.dev\.vars/,
  /^\/\.env/,
  /^\/\.wrangler(\/|$)/,
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (BLOQUEADOS.some((re) => re.test(url.pathname))) {
      return new Response('Not Found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    if (url.pathname === '/api/collect') {
      return coletar(request, env, ctx);
    }

    // Verificação rápida de que o Worker está no ar, sem expor configuração.
    if (url.pathname === '/api/collect/health') {
      return json(
        {
          ok: true,
          meta_token: Boolean(env.META_CAPI_TOKEN),
          ga4_secret: Boolean(env.GA4_API_SECRET),
          shared_secret: Boolean(env.COLLECT_SHARED_SECRET),
        },
        200,
        request
      );
    }

    // Todo o resto continua sendo a landing page estática.
    return env.ASSETS.fetch(request);
  },
};
