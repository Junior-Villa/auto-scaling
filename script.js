import http from 'k6/http';
import { check } from 'k6';
export const options = {
  scenarios: {
    carga: {
      executor: 'constant-arrival-rate',
      rate: 20, //Quantidade de requisicoes por segundo gerada
      timeUnit: '1s', // Tempo entre uma requisicao e outra
      duration: '3m', //Por quanto tempo o teste ficará rodando
      preAllocatedVUs: 50, //Quantidade de usuarios virtuais pre-alocadas
      maxVUs: 150, //Quantidade maxima de usuarios virtuais que podem ser utilizado, esse numero tem incidencia na linha 7, por conta da quantidade de rps
      gracefulStop: '30s',
    },
  },
};
export default function () {
  const headers = {
    Authorization: `Bearer ${__ENV.TOKEN}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const params = {
    headers,
    timeout: '30s',
  };
  const method = (__ENV.METHOD || 'GET').toUpperCase();
  const body = __ENV.BODY || '';
  let res;
  switch (method) {
    case 'POST':
      res = http.post(__ENV.TARGET_URL, body, params);
      break;
    case 'PUT':
      res = http.put(__ENV.TARGET_URL, body, params);
      break;
    case 'DELETE':
      res = http.del(__ENV.TARGET_URL, null, params);
      break;
    default:
      res = http.get(__ENV.TARGET_URL, params);
  }
  check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
  });
  if (res.status >= 300) {
    console.log(`${method} ${__ENV.TARGET_URL} -> ${res.status}`);
  }
}
