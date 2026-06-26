# Kubernetes Autoscaling com KEDA + Prometheus + Grafana k6

Este projeto demonstra como realizar **autoscaling de aplicações Kubernetes utilizando o KEDA**, tendo como métrica a quantidade de **requisições HTTP por segundo (RPS)** coletadas pelo **Prometheus**, ao invés de utilizar apenas CPU ou memória.

Para validar o comportamento do autoscaling, é utilizado o **Grafana k6**, executando testes de carga diretamente dentro do cluster Kubernetes.

---

## Arquitetura

```text
                +----------------------+
                |     Grafana k6       |
                |   Teste de Carga     |
                +----------+-----------+
                           |
                     Requisições HTTP
                           |
                           ▼
                  +-------------------+
                  |   Aplicação       |
                  |   Spring Boot     |
                  +---------+---------+
                            |
                  Micrometer / Actuator
                            |
                            ▼
                    +---------------+
                    |  Prometheus   |
                    +-------+-------+
                            |
                     Consulta PromQL
                            |
                            ▼
                        +--------+
                        |  KEDA  |
                        +--------+
                            |
                  Ajusta quantidade de Pods
                            |
                            ▼
                     Deployment Kubernetes
```

---

## Tecnologias utilizadas

- Kubernetes
- KEDA
- Prometheus
- Spring Boot
- Micrometer
- Grafana k6
- PromQL

---

## Estrutura do projeto

```text
.
├── keda
│   └── scaledobject.yaml
│
└── k6
    ├── script.js
    ├── k6-script-configmap.yaml
    └── run-test.sh
```

---

## Como funciona

O fluxo do autoscaling ocorre da seguinte forma:

1. A aplicação Spring Boot exporta métricas utilizando o Micrometer.
2. O Prometheus coleta essas métricas periodicamente.
3. O KEDA executa uma consulta PromQL no Prometheus.
4. Caso a quantidade de requisições ultrapasse o limite configurado, o KEDA aumenta o número de réplicas do Deployment.
5. Quando a carga diminui, o KEDA reduz automaticamente a quantidade de Pods.

---

## Consulta PromQL utilizada

```promql
sum(
  rate(
    http_server_requests_seconds_count{
      application="sample-api",
      uri!="/actuator/prometheus",
      uri!~"/actuator/health.*"
    }[2m]
  )
)
```

Esta consulta calcula a quantidade de requisições por segundo da aplicação.

Foram removidas da métrica:

- `/actuator/prometheus`
- `/actuator/health`

Dessa forma, apenas as requisições reais da API são consideradas para o autoscaling.

---

## Exemplo de configuração do KEDA

```yaml
minReplicaCount: 3
maxReplicaCount: 6

threshold: 10
```

Onde:

- mínimo de 3 Pods
- máximo de 6 Pods
- escala quando a taxa atingir aproximadamente 10 requisições por segundo

---

## Configurando o teste de carga

### Aplicar o ConfigMap

```bash
kubectl apply -f k6/k6-script-configmap.yaml
```

### Definir as variáveis de ambiente

```bash
export TARGET_URL=http://sample-api:8080/api/exemplo

export METHOD=GET

export TOKEN=<SEU_TOKEN_JWT>
```

Caso a API não utilize autenticação, basta deixar o TOKEN vazio.

---

## Executando o teste

```bash
./k6/run-test.sh
```

O script criará um Pod temporário executando o Grafana k6 dentro do cluster.

---

## Resultado esperado

Durante o teste de carga:

```text
3 Pods
```

↓

```text
4 Pods
```

↓

```text
5 Pods
```

↓

```text
6 Pods
```

Após a redução da carga:

```text
6 Pods
```

↓

```text
5 Pods
```

↓

```text
4 Pods
```

↓

```text
3 Pods
```

Todo esse processo ocorre automaticamente através do KEDA.

---

## Requisitos

- Kubernetes
- KEDA instalado
- Prometheus instalado
- Aplicação exportando métricas pelo Micrometer
- kubectl
- Grafana k6

---

## Objetivo

Este projeto tem como objetivo servir como exemplo prático de implementação de autoscaling orientado por métricas de negócio utilizando:

- KEDA
- Prometheus
- Spring Boot
- Kubernetes
- Grafana k6

Demonstrando uma alternativa ao autoscaling tradicional baseado apenas em CPU e memória.

---

## Contribuições

Contribuições são bem-vindas.

Caso encontre melhorias, abra uma Issue ou envie um Pull Request.
