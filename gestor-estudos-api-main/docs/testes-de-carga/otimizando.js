import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

// === MÉTRICA DE THROUGHPUT ===
const throughput = new Counter('throughput');

// === CONFIGURAÇÃO DO TESTE ===
export const options = {
  summaryTrendStats: ['avg', 'min', 'max', 'p(90)', 'p(95)', 'p(99)'],
  vus: 20,
  duration: '30s',

  thresholds: {
    'http_req_duration': ['p(95)<800'],
    'throughput': ['rate>10'],
  },
};

// === TESTE DE LEITURA EM /plans ===
export default function () {
  // Substitua 'SEU_TOKEN_AQUI' por um token de acesso válido da sua API.
  const authToken = 'SEU_TOKEN_AQUI';

  // Crie um objeto com os cabeçalhos da requisição
  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json', // É uma boa prática incluir o Content-Type
    },
  };

  // Faça a requisição GET, passando a URL e os parâmetros (incluindo os headers)
  const res = http.get('https://gestor-estudos-api.onrender.com/api/plans', params);
  throughput.add(1);

  // A verificação (check) agora deve esperar um status 200
  check(res, {
    'status 200': (r) => r.status === 200,
  });

  // Opcional: você pode logar o status para depurar
  if (res.status !== 200) {
    console.log(`Status retornado: ${res.status}`);
    console.log(`Resposta: ${res.body}`);
  }
}