import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

/* CONFIGURAÇÕES GERAIS */
export const options = {
  summaryTrendStats: ['avg', 'min', 'max', 'p(90)', 'p(95)', 'p(99)'],
  scenarios: {
    leitura: {
      executor: 'ramping-arrival-rate',
      exec: 'lerEndpoint',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 100,
      stages: [
        { duration: '1m', target: 40 },
        { duration: '2m', target: 80 },
        { duration: '30s', target: 0 },
      ],
    },
    escrita: {
      executor: 'ramping-arrival-rate',
      exec: 'escreverEndpoint',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 100,
      stages: [
        { duration: '1m', target: 8 },
        { duration: '2m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      startTime: '30s',
    },
  },
  thresholds: {
    'http_req_duration{endpoint:leitura}':  ['p(95)<500'],
    'http_req_duration{endpoint:escrita}':  ['p(95)<700'],
    'throughput{endpoint:leitura}':  ['rate>30'],
    'throughput{endpoint:escrita}':  ['rate>8'],
  },
};

const throughput = new Counter('throughput');

/* URL BASE E LOGIN */
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api';
const CREDENTIALS = { email: 'teste@email.com', password: '123' };

export function setup() {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify(CREDENTIALS), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'login OK': (r) => r.status === 200 });
  const { token } = res.json();
  return { token };
}

/* CENÁRIO DE LEITURA */
export function lerEndpoint(data) {
  const params = {
    headers: { Authorization: `Bearer ${data.token}` },
    tags: { endpoint: 'leitura' },
  };
  const res = http.get(`${BASE_URL}/plans`, params);
  throughput.add(1, { endpoint: 'leitura' });
  check(res, { 'GET OK': (r) => r.status === 200 });
  sleep(1);
}

/* CENÁRIO DE ESCRITA */
export function escreverEndpoint(data) {
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
    tags: { endpoint: 'escrita' },
  };
  const res = http.post(`${BASE_URL}/plans`, payload, params);
  throughput.add(1, { endpoint: 'escrita' });
  check(res, { 'POST criado': (r) => r.status === 201 });
  sleep(1);
}

