import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

/* =========================================================
 * CONFIGURAÇÕES GERAIS
 * ======================================================= */
export const options = {
  summaryTrendStats: ['avg', 'min', 'max', 'p(90)', 'p(95)', 'p(99)'],

  // Dois cenários independentes, cada um medindo um endpoint
  scenarios: {
    // --------------- LEITURA -----------------
    read_plans: {
      executor: 'ramping-arrival-rate',      // controla vazão (reqs/s)
      exec: 'readPlans',                     // função a ser chamada
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 20,                   // VUs já alocados
      maxVUs: 100,
      stages: [
        { duration: '1m', target: 50 },      // sobe até 50 req/s
        { duration: '2m', target: 100 },     // stress a 100 req/s
        { duration: '30s', target: 0 },      // rampa down
      ],
    },

    // --------------- ESCRITA -----------------
    write_plans: {
      executor: 'ramping-arrival-rate',
      exec: 'createPlan',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 100,
      stages: [
        { duration: '1m', target: 10 },      // 10 req/s
        { duration: '2m', target: 25 },      // 25 req/s
        { duration: '30s', target: 0 },
      ],
      startTime: '30s',                      // começa 30 s depois do outro
    },
  },

  // Limites de aceite (ajuste conforme necessidade)
  thresholds: {
    // Latência (95 º percentil)
    'http_req_duration{endpoint:readPlans}':  ['p(95)<400'],
    'http_req_duration{endpoint:createPlan}': ['p(95)<600'],

    // Vazão média – contador customizado criado abaixo
    'throughput{endpoint:readPlans}':  ['rate>40'],  // 40 req/s em média
    'throughput{endpoint:createPlan}': ['rate>8'],   // 8  req/s em média
  },
};

/* =========================================================
 * MÉTRICA CUSTOMIZADA DE VAZÃO
 * ======================================================= */
const throughput = new Counter('throughput');

/* =========================================================
 * URL BASE E DADOS DE ACESSO
 * ======================================================= */
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const CREDENTIALS = { email: 'teste@email.com', password: '123' };

/* =========================================================
 * SETUP – LOGIN SÓ UMA VEZ
 * ======================================================= */
export function setup() {
  console.log('Tentando efetuar login...');
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(CREDENTIALS), {
    headers: { 'Content-Type': 'application/json' },
  });

  // VERIFICA SE O LOGIN DEU CERTO (status 200 ou 201)
  if (res.status !== 200 && res.status !== 201) {
    // Se o login falhar, joga um erro e PARA O TESTE INTEIRO.
    console.error('Erro no login!');
    console.error(`Status: ${res.status}`);
    console.error(`Corpo: ${res.body}`);
    throw new Error('Falha ao obter o token de autenticação no setup. Abortando teste.');
  }

  // Se o login funcionou, extrai o token e continua.
  console.log('Login bem-sucedido, extraindo token...');
  const { token } = res.json();
  if (!token) {
    throw new Error('Resposta do login não continha um token.');
  }
  
  return { token };
}

/* =========================================================
 * Cenário de LEITURA – GET /plans
 * ======================================================= */
export function readPlans(data) {
  const params = { headers: { Authorization: `Bearer ${data.token}` }, tags: { endpoint: 'readPlans' } };

  const res = http.get(`${BASE_URL}/api/plans`, params);
  throughput.add(1, { endpoint: 'readPlans' });

  check(res, { 'GET 200': (r) => r.status === 200 });

  // Pequeno sleep apenas para dar realismo a cada VU;
  // a vazão principal é controlada pelo executor.
  sleep(1);
}

/* =========================================================
 * Cenário de ESCRITA – POST /plans
 * ======================================================= */
export function createPlan(data) {
  const payload = JSON.stringify({
    name: `Plano ENEM ${__ITER}`,
    description: 'Estudos para o ENEM 2025',
    startDate: '2025-06-01',
    endDate: '2025-11-01',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.token}`,
    },
    tags: { endpoint: 'createPlan' },
  };

  const res = http.post(`${BASE_URL}/api/plans`, payload, params);
  throughput.add(1, { endpoint: 'createPlan' });

  check(res, { 'POST 201': (r) => r.status === 201 });

  sleep(1);
}

/* =========================================================
 * TEARDOWN – se precisar remover dados criados, faça aqui
 * ======================================================= */
export function teardown(data) {
  // Ex.: deletar planos criados durante o teste
}
