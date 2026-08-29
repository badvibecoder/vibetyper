#!/usr/bin/env node
// generate-yaml.mjs
// Generates the vibetyper YAML dictionary: realistic, self-contained YAML
// blocks (compose files, CI pipelines, Kubernetes manifests, app configs...)
// written in "blank" split mode — every block is contiguous (no blank lines
// inside) and blocks are separated by a blank line.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../../dictionary/yaml');
fs.mkdirSync(OUT, { recursive: true });

const blocks = [];
const add = (tpl, variants) => {
  for (const v of variants) {
    // Blank lines are optional in YAML; strip them so every block stays
    // contiguous (the dictionary uses "blank" split mode).
    const text = tpl(v).trim().replace(/\n[ \t]*\n+/g, '\n');
    if (!text) continue;
    blocks.push(text);
  }
};

// ===========================================================================
// Docker Compose
// ===========================================================================
add(({ app, db }) => `services:
  ${app}:
    image: nginx:1.27-alpine
    ports:
      - "8080:80"
    depends_on:
      - ${db}
  ${db}:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: shopdb
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: localdev
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata: {}`, [
  { app: 'web', db: 'db' },
  { app: 'admin', db: 'catalog-db' },
]);

add(({ api, cache }) => `services:
  ${api}:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      REDIS_URL: redis://${cache}:6379
    depends_on:
      - ${cache}
  ${cache}:
    image: redis:7.4-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
volumes:
  redis-data: {}`, [
  { api: 'api', cache: 'cache' },
  { api: 'billing', cache: 'redis' },
]);

add(({ stack }) => `services:
  web:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
    depends_on:
      - api
  api:
    build: .
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
      REDIS_URL: redis://redis:6379
      QUEUE_URL: amqp://guest:guest@rabbitmq:5672
    depends_on:
      - db
      - redis
      - rabbitmq
  worker:
    build: .
    command: npm run worker
    environment:
      QUEUE_URL: amqp://guest:guest@rabbitmq:5672
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${stack}
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
  redis:
    image: redis:7.4-alpine
  rabbitmq:
    image: rabbitmq:3.13-management`, [
  { stack: 'app' },
  { stack: 'orders' },
]);

add(({ svc }) => `services:
  ${svc}:
    build: ./worker
    restart: on-failure
    environment:
      AMQP_URL: amqp://guest:guest@mq:5672
      AMQP_QUEUE: jobs
      AMQP_CONSUMER_TAG: ${svc}-worker
    depends_on:
      mq:
        condition: service_healthy
  mq:
    image: rabbitmq:3.13-management
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5`, [
  { svc: 'emailer' },
  { svc: 'report-builder' },
]);

add(({ bucket }) => `services:
  minio:
    image: minio/minio:RELEASE.2024-08-03T04-33-23Z
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio-data:/data
  createbuckets:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 minioadmin minioadmin &&
      mc mb --ignore-existing local/${bucket} &&
      mc anonymous set download local/${bucket}/public
      "`, [
  { bucket: 'uploads' },
  { bucket: 'backups' },
]);

add(({ host }) => `services:
  prometheus:
    image: prom/prometheus:v2.53.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    command:
      - --config.file=/etc/prometheus/prometheus.yml
      - --storage.tsdb.retention.time=30d
      - --web.external-url=http://${host}
  grafana:
    image: grafana/grafana:11.1.0
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_USERS_ALLOW_SIGN_UP: "false"
      GF_SERVER_ROOT_URL: http://${host}
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
volumes:
  grafana-data: {}`, [
  { host: 'metrics.local' },
  { host: 'ops.local' },
]);

add(() => `services:
  mailhog:
    image: mailhog/mailhog:v1.0.1
    ports:
      - "1025:1025"
      - "8025:8025"
  app:
    build: .
    environment:
      SMTP_HOST: mailhog
      SMTP_PORT: 1025
      SMTP_FROM: no-reply@acme.test
      MAIL_PREVIEW_URL: http://localhost:8025`, [
  {},
]);

add(() => `services:
  elasticsearch:
    image: elasticsearch:8.14.2
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"
      ES_JAVA_OPTS: -Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - es-data:/usr/share/elasticsearch/data
  kibana:
    image: kibana:8.14.2
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      - elasticsearch
volumes:
  es-data: {}`, [
  {},
]);

add(({ svc, db }) => `services:
  ${svc}:
    build: .
    ports:
      - "5000:5000"
    environment:
      DB_HOST: ${db}
      DB_PORT: 5432
      DB_NAME: products
      DB_USER: catalog
    depends_on:
      ${db}:
        condition: service_healthy
  ${db}:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: products
      POSTGRES_USER: catalog
      POSTGRES_PASSWORD: localdev
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U catalog"]
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data: {}`, [
  { svc: 'catalog', db: 'db' },
  { svc: 'inventory', db: 'postgres' },
]);

add(() => `services:
  web:
    image: nginx:1.27-alpine
    profiles: ["frontend"]
    ports:
      - "80:80"
  api:
    build: .
    profiles: ["backend"]
    ports:
      - "8000:8000"
  seed:
    build: .
    profiles: ["tools"]
    command: npm run seed
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app`, [
  {},
]);

add(({ name }) => `services:
  app:
    build: .
    restart: unless-stopped
    environment:
      NODE_ENV: production
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
  db:
    image: postgres:16-alpine
    restart: always
    volumes:
      - ${name}-data:/var/lib/postgresql/data
volumes:
  ${name}-data: {}`, [
  { name: 'main' },
  { name: 'analytics' },
]);

add(() => `x-common: &common
  restart: unless-stopped
  networks:
    - backend
services:
  api:
    <<: *common
    build: ./api
    ports:
      - "8080:8080"
  worker:
    <<: *common
    build: ./worker
    command: node worker.js
    depends_on:
      - api
networks:
  backend:`, [
  {},
]);

add(({ port }) => `services:
  rs:
    build: .
    ports:
      - "${port}:8000"
    environment:
      RUST_LOG: info
      DATABASE_URL: postgres://app:app@db:5432/app
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app`, [
  { port: '8001' },
  { port: '8010' },
]);

add(() => `services:
  trainer:
    build: ./ml
    environment:
      PYTHONUNBUFFERED: "1"
      DATASET_PATH: /data/train.csv
      MODEL_OUTPUT: /models/latest.pkl
    volumes:
      - ./data:/data:ro
      - ./models:/models
    command: python train.py --epochs 50 --batch-size 32
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]`, [
  {},
]);

add(({ region }) => `services:
  api:
    image: us-docker.pkg.dev/${region}/apps/api:1.4.0
    ports:
      - "8080:8080"
    environment:
      GCP_PROJECT: ${region}-monitoring
      GCP_REGION: ${region}
  collector:
    image: otel/opentelemetry-collector-contrib:0.104.0
    command: ["--config=/etc/otel/config.yaml"]
    volumes:
      - ./otel.yaml:/etc/otel/config.yaml:ro
    depends_on:
      - api`, [
  { region: 'us-central1' },
  { region: 'europe-west1' },
]);

add(() => `services:
  app:
    env_file:
      - .env
      - .env.local
    image: node:20-slim
    working_dir: /srv/app
    command: node server.js
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: app
      MYSQL_USER: app
      MYSQL_PASSWORD: app
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - mysql-data:/var/lib/mysql
volumes:
  mysql-data: {}`, [
  {},
]);

add(() => `services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
      args:
        - GO_VERSION=1.22
    ports:
      - "9090:9090"
    environment:
      GIN_MODE: release
      PORT: "9090"
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: goapp
      POSTGRES_USER: goapp
      POSTGRES_PASSWORD: localdev`, [
  {},
]);

add(() => `services:
  web:
    image: nginx:1.27-alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
  app:
    build: .
    expose:
      - "8000"
    environment:
      APP_PORT: "8000"
      TRUST_PROXY: "true"`, [
  {},
]);

add(() => `services:
  override-example:
    image: busybox:1.36
    command: echo "override file demo"
  app:
    image: node:20-slim
    command: node server.js
    environment:
      NODE_ENV: development`, [
  {},
]);

// ===========================================================================
// GitHub Actions
// ===========================================================================
add(({ node }) => `name: ci

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${node}
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build`, [
  { node: 20 },
  { node: 22 },
]);

add(() => `name: ci

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
      - run: pip install -e ".[dev]"
      - run: pytest --cov=. --cov-report=xml
      - uses: codecov/codecov-action@v4`, [
  {},
]);

add(() => `name: ci

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: "1.22"
      - run: go vet ./...
      - run: go test -race -cover ./...
      - run: go build ./cmd/server`, [
  {},
]);

add(({ image }) => `name: publish

on:
  push:
    tags: ["v*"]

env:
  REGISTRY: ghcr.io
  IMAGE: \${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${image}:\${{ github.ref_name }}
          cache-from: type=gha
          cache-to: type=gha,mode=max`, [
  { image: '${{ github.repository }}' },
  { image: 'ghcr.io/acme/backend' },
]);

add(() => `name: deploy

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://acme-web/ --delete
      - run: aws cloudfront create-invalidation --distribution-id \${{ secrets.CF_DIST_ID }} --paths "/*"`, [
  {},
]);

add(() => `name: release

on:
  push:
    tags: ["v*"]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - run: npx conventional-changelog-cli -p angular -i CHANGELOG.md -s
      - uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const notes = fs.readFileSync('CHANGELOG.md', 'utf8');
            github.rest.repos.createRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              tag_name: context.ref.replace('refs/tags/', ''),
              body: notes.slice(0, 1000),
              draft: false,
              prerelease: false,
            });`, [
  {},
]);

add(() => `name: docs

on:
  push:
    branches: [main]
    paths: ["docs/**"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install mkdocs-material
      - run: mkdocs build --strict
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./site`, [
  {},
]);

add(() => `name: e2e

on:
  push:
    branches: [main]
  pull_request:

jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7`, [
  {},
]);

add(() => `name: bench

on:
  push:
    branches: [main]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run bench > bench.txt
      - uses: benchmark-action/github-action-benchmark@v1
        with:
          tool: benchmarksuite
          output-file-path: bench.txt
          github-token: \${{ secrets.GITHUB_TOKEN }}
          auto-push: true`, [
  {},
]);

add(() => `name: deps

on:
  pull_request:

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
          allow-licenses: MIT, Apache-2.0, BSD-3-Clause`, [
  {},
]);

add(() => `name: security

on:
  push:
    branches: [main]

jobs:
  sonar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - run: mvn clean verify
      - uses: sonarsource/sonarqube-scan-action@v3
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: \${{ secrets.SONAR_HOST_URL }}`, [
  {},
]);

add(() => `name: lint

on:
  pull_request:

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx eslint . --max-warnings 0
      - run: npx prettier --check "src/**/*.{ts,tsx}"`, [
  {},
]);

add(() => `name: auto-merge

on:
  pull_request_target:

permissions:
  contents: write
  pull-requests: write

jobs:
  merge:
    runs-on: ubuntu-latest
    if: \${{ github.actor == 'dependabot[bot]' }}
    steps:
      - uses: actions/checkout@v4
      - uses: ahmadnassri/action-dependabot-auto-merge@v2
        with:
          target: minor
          github-token: \${{ secrets.GITHUB_TOKEN }}`, [
  {},
]);

add(() => `name: build

on:
  workflow_call:
    inputs:
      environment:
        type: string
        required: true
    secrets:
      deploy_token:
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    environment: \${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: ./deploy.sh \${{ inputs.environment }}
        env:
          TOKEN: \${{ secrets.deploy_token }}`, [
  {},
]);

// ===========================================================================
// Kubernetes manifests
// ===========================================================================
add(({ name, image, port, replicas }) => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  labels:
    app: ${name}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
        - name: ${name}
          image: ${image}
          ports:
            - containerPort: ${port}
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi`, [
  { name: 'web', image: 'nginx:1.27-alpine', port: 80, replicas: 3 },
  { name: 'api', image: 'ghcr.io/acme/api:1.4.0', port: 8080, replicas: 4 },
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
  labels:
    app: worker
spec:
  replicas: 2
  selector:
    matchLabels:
      app: worker
  template:
    metadata:
      labels:
        app: worker
    spec:
      containers:
        - name: worker
          image: ghcr.io/acme/worker:2.1.0
          env:
            - name: QUEUE_URL
              value: amqp://guest:guest@rabbitmq:5672
            - name: QUEUE_NAME
              value: tasks
          readinessProbe:
            exec:
              command: ["sh", "-c", "kill -0 1"]
            initialDelaySeconds: 5
            periodSeconds: 10`, [
  {},
]);

add(({ name, port }) => `apiVersion: v1
kind: Service
metadata:
  name: ${name}
spec:
  selector:
    app: ${name}
  ports:
    - protocol: TCP
      port: 80
      targetPort: ${port}
  type: ClusterIP`, [
  { name: 'web', port: 80 },
  { name: 'api', port: 8080 },
]);

add(() => `apiVersion: v1
kind: Service
metadata:
  name: api-lb
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-scheme: internet-facing
spec:
  selector:
    app: api
  ports:
    - port: 443
      targetPort: 8080
  type: LoadBalancer`, [
  {},
]);

add(() => `apiVersion: v1
kind: Service
metadata:
  name: api-nodeport
spec:
  selector:
    app: api
  type: NodePort
  ports:
    - port: 8080
      nodePort: 30080
      protocol: TCP`, [
  {},
]);

add(({ app, loglevel }) => `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${app}-config
data:
  APP_ENV: production
  LOG_LEVEL: ${loglevel}
  MAX_UPLOAD_MB: "25"
  FEATURE_FLAGS: "new-checkout,realtime-sync"
  REDIS_URL: redis://redis:6379/0`, [
  { app: 'catalog', loglevel: 'info' },
  { app: 'payments', loglevel: 'warn' },
]);

add(() => `apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-conf
data:
  nginx.conf: |
    server {
      listen 80;
      server_name _;
      root /usr/share/nginx/html;
      gzip on;
      location /api/ {
        proxy_pass http://api:8080;
      }
    }`, [
  {},
]);

add(({ name }) => `apiVersion: v1
kind: Secret
metadata:
  name: ${name}-credentials
type: Opaque
stringData:
  DB_PASSWORD: hunter2-local-only
  API_TOKEN: k8s-secret-demo-token
  SMTP_PASSWORD: dev-smtp-pass`, [
  { name: 'db' },
  { name: 'smtp' },
]);

add(() => `apiVersion: v1
kind: Secret
metadata:
  name: tls-acme
type: kubernetes.io/tls
data:
  tls.crt: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCg==
  tls.key: LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCg==`, [
  {},
]);

add(({ host }) => `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  rules:
    - host: ${host}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80`, [
  { host: 'app.example.com' },
  { host: 'shop.example.org' },
]);

add(() => `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /v1(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: api
                port:
                  number: 8080`, [
  {},
]);

add(({ pvc }) => `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${pvc}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: standard`, [
  { pvc: 'postgres-data' },
  { pvc: 'minio-data' },
]);

add(() => `apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: ghcr.io/acme/backup:1.2.0
              args: ["--db", "postgres", "--bucket", "s3://acme-backups"]
              env:
                - name: AWS_REGION
                  value: eu-west-1`, [
  {},
]);

add(() => `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`, [
  {},
]);

add(() => `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-web
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: web
      ports:
        - protocol: TCP
          port: 8080`, [
  {},
]);

add(() => `apiVersion: v1
kind: ServiceAccount
metadata:
  name: deployer
  namespace: ci
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployer-role
  namespace: apps
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "update", "patch"]`, [
  {},
]);

add(() => `apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployer-binding
  namespace: apps
subjects:
  - kind: ServiceAccount
    name: deployer
    namespace: ci
roleRef:
  kind: Role
  name: deployer-role
  apiGroup: rbac.authorization.k8s.io`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      tolerations:
        - operator: Exists
      containers:
        - name: exporter
          image: prom/node-exporter:v1.8.2
          ports:
            - containerPort: 9100
          args:
            - --path.rootfs=/host
          volumeMounts:
            - name: root
              mountPath: /host
              readOnly: true
      volumes:
        - name: root
          hostPath:
            path: /`, [
  {},
]);

add(() => `apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  ttlSecondsAfterFinished: 300
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: ghcr.io/acme/migrate:3.0.0
          command: ["prisma", "migrate", "deploy"]
          env:
            - name: DATABASE_URL
              value: postgres://app:app@postgres:5432/app`, [
  {},
]);

add(() => `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: api`, [
  {},
]);

add(() => `apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: apps
spec:
  hard:
    requests.cpu: "8"
    requests.memory: 16Gi
    limits.cpu: "16"
    limits.memory: 32Gi
    pods: "40"`, [
  {},
]);

add(() => `apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: apps
spec:
  limits:
    - default:
        cpu: 500m
        memory: 512Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      type: Container`, [
  {},
]);

add(() => `apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: prod-gateway
spec:
  gatewayClassName: nginx
  listeners:
    - name: http
      port: 80
      protocol: HTTP
    - name: https
      port: 443
      protocol: HTTPS
      tls:
        certificateRefs:
          - name: wildcard-tls`, [
  {},
]);

add(() => `apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-route
spec:
  parentRefs:
    - name: prod-gateway
  hostnames:
    - api.example.com
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /v1
      backendRefs:
        - name: api
          port: 8080`, [
  {},
]);

add(() => `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
  - ingress.yaml
commonLabels:
  app: storefront
images:
  - name: ghcr.io/acme/web
    newTag: 2.5.1
patches:
  - target:
      kind: Deployment
      name: web
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 5`, [
  {},
]);

add(() => `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payments
  namespace: argocd
spec:
  project: platform
  source:
    repoURL: https://github.com/acme/platform-charts
    path: charts/payments
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: payments
  syncPolicy:
    automated:
      prune: true
      selfHeal: true`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7.4-alpine
          args: ["--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
          ports:
            - containerPort: 6379
          resources:
            limits:
              memory: 512Mi`, [
  {},
]);

add(({ app }) => `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${app}-env
data:
  DATABASE_URL: postgres://app:app@postgres:5432/${app}
  REDIS_URL: redis://redis:6379/1
  S3_BUCKET: ${app}-assets
  S3_ENDPOINT: http://minio:9000`, [
  { app: 'billing' },
  { app: 'notifications' },
]);

// ===========================================================================
// Helm values
// ===========================================================================
add(({ app, port }) => `replicaCount: 2

image:
  repository: ghcr.io/acme/${app}
  tag: "1.12.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: ${port}

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: ${app}.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 1
    memory: 1Gi
  requests:
    cpu: 250m
    memory: 256Mi`, [
  { app: 'api', port: 80 },
  { app: 'console', port: 8080 },
]);

add(() => `autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 8
  targetCPUUtilizationPercentage: 75

serviceAccount:
  create: true
  name: app-sa

podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "9090"

nodeSelector:
  kubernetes.io/os: linux

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - api
          topologyKey: topology.kubernetes.io/zone`, [
  {},
]);

add(() => `image:
  repository: registry.example.com/checkout
  tag: "2024.08.1"

env:
  - name: STRIPE_SECRET_KEY
    valueFrom:
      secretKeyRef:
        name: checkout-secrets
        key: stripe-key
  - name: STRIPE_WEBHOOK_SECRET
    valueFrom:
      secretKeyRef:
        name: checkout-secrets
        key: webhook-secret

ingress:
  enabled: true
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  tls:
    - secretName: checkout-tls
      hosts:
        - checkout.example.com`, [
  {},
]);

add(() => `postgresql:
  enabled: true
  auth:
    username: app
    database: app
    existingSecret: app-pg-secret
  primary:
    persistence:
      size: 100Gi
      storageClass: gp3

redis:
  enabled: true
  architecture: standalone
  auth:
    enabled: true
    existingSecret: app-redis-secret`, [
  {},
]);

add(() => `serviceMonitor:
  enabled: true
  interval: 30s
  scrapeTimeout: 10s
  labels:
    release: kube-prometheus-stack

grafana:
  dashboard:
    enabled: true
    label: grafana_dashboard
    labelValue: "1"
    namespace: monitoring`, [
  {},
]);

add(() => `nameOverride: notifications
fullnameOverride: notifications

replicaCount: 3

livenessProbe:
  httpGet:
    path: /healthz
    port: http
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /readyz
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10`, [
  {},
]);

// ===========================================================================
// dbt
// ===========================================================================
add(() => `version: 2

sources:
  - name: ecommerce
    database: analytics
    schema: raw
    tables:
      - name: orders
        description: Raw order events from the checkout service
        columns:
          - name: order_id
            tests:
              - unique
              - not_null
      - name: customers
        loaded_at_field: ingested_at
        freshness:
          warn_after: {count: 24, period: hour}
          error_after: {count: 72, period: hour}`, [
  {},
]);

add(() => `version: 2

sources:
  - name: web_analytics
    database: bigquery-public-data
    schema: ga4_obfuscated_sample_ecommerce
    tables:
      - name: events_20240101
        columns:
          - name: event_name
          - name: user_pseudo_id
          - name: event_timestamp
      - name: events_20240102`, [
  {},
]);

add(() => `version: 2

models:
  - name: stg_orders
    description: Staged orders with cleaned payment status
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: status
        tests:
          - accepted_values:
              values: ['placed', 'shipped', 'delivered', 'cancelled']
    config:
      materialized: view

  - name: stg_payments
    description: Staged payment records from the ledger
    columns:
      - name: payment_id
        tests:
          - unique
          - not_null
      - name: amount
        tests:
          - not_null`, [
  {},
]);

add(() => `version: 2

models:
  - name: dim_customers
    config:
      materialized: table
      tags: ["core"]
    columns:
      - name: customer_id
        tests:
          - unique
          - not_null
      - name: lifetime_value
        tests:
          - not_null

  - name: fct_orders
    config:
      materialized: incremental
      unique_key: order_id
      incremental_strategy: merge
    columns:
      - name: order_id
        tests:
          - unique
          - not_null`, [
  {},
]);

add(() => `version: 2

seeds:
  - name: country_codes
    config:
      delimiter: ";"
      quote: '"'
  - name: sales_regions
    config:
      schema: lookup
      column_types:
        region_id: integer
        region_name: varchar(64)`, [
  {},
]);

add(() => `version: 2

exposures:
  - name: weekly_revenue_dashboard
    label: Weekly Revenue
    type: dashboard
    url: https://looker.example.com/dashboards/revenue
    depends_on:
      - ref("fct_orders")
      - ref("dim_customers")
    owner:
      name: Finance Analytics
      email: finance-analytics@example.com`, [
  {},
]);

add(() => `version: 2

snapshots:
  - name: customers_snapshot
    config:
      strategy: timestamp
      updated_at: updated_at
      target_schema: snapshots
      unique_key: customer_id
    source: raw.customers`, [
  {},
]);

add(() => `version: 2

macros:
  - name: cents_to_dollars
    arguments:
      - name: amount
        type: integer
      - name: decimal_places
        type: integer
        default: 2
  - name: generate_surrogate_key
    arguments:
      - name: fields
        type: list`, [
  {},
]);

add(() => `packages:
  - package: dbt-labs/dbt_utils
    version: 1.2.0
  - package: dbt-labs/codegen
    version: 0.12.1
  - git: "https://github.com/acme/dbt-packages.git"
    revision: main`, [
  {},
]);

add(() => `name: analytics
version: "1.0.0"
config-version: 2

profile: analytics

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

target-path: "target"
clean-targets:
  - "target"
  - "dbt_packages"

models:
  staging:
    +materialized: view
  marts:
    +materialized: table`, [
  {},
]);

// ===========================================================================
// Ansible
// ===========================================================================
add(() => `- name: Update apt cache
  hosts: all
  become: true
  tasks:
    - name: Update apt cache
      apt:
        update_cache: true
        cache_valid_time: 3600

    - name: Upgrade all packages
      apt:
        upgrade: dist
        autoremove: true`, [
  {},
]);

add(() => `- name: Deploy web application
  hosts: web
  become: true
  vars:
    app_dir: /srv/app
    app_user: www-data
  tasks:
    - name: Create application directory
      file:
        path: "{{ app_dir }}"
        state: directory
        owner: "{{ app_user }}"

    - name: Copy application artifacts
      copy:
        src: ./dist/
        dest: "{{ app_dir }}/public"
        owner: "{{ app_user }}"

    - name: Restart web service
      systemd:
        name: app-web
        state: restarted
        daemon_reload: true`, [
  {},
]);

add(() => `- name: Configure nginx vhost
  hosts: proxy
  become: true
  tasks:
    - name: Write site configuration
      template:
        src: templates/site.conf.j2
        dest: /etc/nginx/sites-available/app.conf

    - name: Enable site
      file:
        src: /etc/nginx/sites-available/app.conf
        dest: /etc/nginx/sites-enabled/app.conf
        state: link

    - name: Test configuration
      command: nginx -t
      notify: reload nginx

  handlers:
    - name: reload nginx
      service:
        name: nginx
        state: reloaded`, [
  {},
]);

add(() => `- name: Provision database user
  hosts: db
  become: true
  tasks:
    - name: Create application user
      postgresql_user:
        name: app
        password: "{{ db_password }}"
        db: app
        role_attr_flags: LOGIN

    - name: Grant schema privileges
      postgresql_privs:
        db: app
        objs: public
        privs: SELECT,INSERT,UPDATE,DELETE
        role: app

    - name: Create backup role
      postgresql_user:
        name: backup_user
        password: "{{ backup_password }}"
        role_attr_flags: REPLICATION`, [
  {},
]);

add(() => `- name: Harden server firewall
  hosts: all
  become: true
  tasks:
    - name: Allow SSH
      ufw:
        rule: allow
        port: "22"
        proto: tcp

    - name: Allow web traffic
      ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      loop:
        - "80"
        - "443"

    - name: Enable firewall
      ufw:
        state: enabled
        policy: deny`, [
  {},
]);

add(() => `- name: Install monitoring agents
  hosts: all
  become: true
  tasks:
    - name: Install node_exporter
      get_url:
        url: https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz
        dest: /opt/node_exporter.tar.gz

    - name: Extract archive
      unarchive:
        src: /opt/node_exporter.tar.gz
        dest: /opt
        remote_src: true

    - name: Enable node_exporter service
      systemd:
        name: node_exporter
        enabled: true
        state: started`, [
  {},
]);

add(() => `- name: Add deploy users
  hosts: all
  become: true
  tasks:
    - name: Create user accounts
      user:
        name: "{{ item.name }}"
        groups: "{{ item.groups | default([]) }}"
        shell: /bin/bash
      loop:
        - {name: alice, groups: [sudo, docker]}
        - {name: bob, groups: [www-data]}

    - name: Install SSH keys
      authorized_key:
        user: "{{ item.name }}"
        key: "{{ item.key }}"
      loop:
        - {name: alice, key: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... alice@laptop"}
        - {name: bob, key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... bob@work"}`, [
  {},
]);

add(() => `- name: Schedule nightly backups
  hosts: db
  become: true
  tasks:
    - name: Install backup script
      copy:
        src: files/backup.sh
        dest: /usr/local/bin/backup.sh
        mode: "0755"

    - name: Add cron job
      cron:
        name: nightly pg_dump
        minute: "30"
        hour: "2"
        job: /usr/local/bin/backup.sh > /var/log/backup.log 2>&1

    - name: Add retention cleanup
      cron:
        name: prune old backups
        weekday: "0"
        job: find /backups -name "*.sql.gz" -mtime +14 -delete`, [
  {},
]);

// ===========================================================================
// Observability: Prometheus / Grafana / Loki / Alertmanager
// ===========================================================================
add(() => `global:
  scrape_interval: 15s
  evaluation_interval: 30s

scrape_configs:
  - job_name: node
    static_configs:
      - targets: ["localhost:9100"]
  - job_name: api
    metrics_path: /metrics
    scheme: http
    static_configs:
      - targets: ["api.internal:8080"]
    relabel_configs:
      - source_labels: [__address__]
        regex: "(.*):.*"
        target_label: instance`, [
  {},
]);

add(() => `groups:
  - name: host_alerts
    rules:
      - alert: HighCPULoad
        expr: avg(rate(node_cpu_seconds_total{mode="user"}[5m])) by (instance) > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "CPU load above 85% on {{ $labels.instance }}"
      - alert: DiskAlmostFull
        expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} < 0.1
        for: 15m
        labels:
          severity: critical
        annotations:
          summary: "Less than 10% disk space left on {{ $labels.instance }}"`, [
  {},
]);

add(() => `groups:
  - name: service_alerts
    rules:
      - alert: ApiErrorRateHigh
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: page
        annotations:
          summary: "API 5xx rate above 5%"
          runbook: https://runbooks.example.com/api-error-rate
      - alert: QueueBacklog
        expr: rabbitmq_queue_messages_ready > 5000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "RabbitMQ queue backlog above 5000 messages"`, [
  {},
]);

add(() => `groups:
  - name: recording
    rules:
      - record: job:http_request_duration_seconds:histogram_quantile
        expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))
      - record: instance:node_cpu_usage:rate5m
        expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
      - record: job:http_errors:ratio5m
        expr: sum by (job) (rate(http_requests_total{status=~"5.."}[5m])) / sum by (job) (rate(http_requests_total[5m]))`, [
  {},
]);

add(() => `apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    jsonData:
      maxLines: 1000
  - name: Postgres
    type: postgres
    url: postgres:5432
    database: grafana
    user: grafana
    secureJsonData:
      password: grafana
    jsonData:
      sslmode: disable`, [
  {},
]);

add(() => `auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h`, [
  {},
]);

add(() => `route:
  group_by: ["alertname"]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: team-email
  routes:
    - match:
        severity: page
      receiver: oncall-pager

receivers:
  - name: team-email
    email_configs:
      - to: eng-alerts@example.com
        from: alertmanager@example.com
        smarthost: smtp.example.com:587
  - name: oncall-pager
    webhook_configs:
      - url: https://api.pagerduty.com/v2/enqueue
        send_resolved: true`, [
  {},
]);

add(() => `service:
  parsers: json
  inputs:
    - name: tail
      tag: app.*
      path: /var/log/app/*.log
  filters:
    - name: grep
      match: "level=error"
  outputs:
    - name: loki
      match: "*"
      host: loki
      port: 3100
      labels:
        job: app-logs`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
        - name: prometheus
          image: prom/prometheus:v2.53.0
          args:
            - --config.file=/etc/prometheus/prometheus.yml
            - --storage.tsdb.retention.size=50GB
          ports:
            - containerPort: 9090
          volumeMounts:
            - name: config
              mountPath: /etc/prometheus
      volumes:
        - name: config
          configMap:
            name: prometheus-config`, [
  {},
]);

// ===========================================================================
// OpenAPI
// ===========================================================================
add(() => `openapi: 3.0.3
info:
  title: Catalog API
  version: 2.1.0
  description: Product catalog with search and inventory.
paths:
  /products:
    get:
      summary: List products
      parameters:
        - name: category
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        "200":
          description: A page of products`, [
  {},
]);

add(() => `openapi: 3.0.3
info:
  title: Orders API
  version: 1.4.0
paths:
  /orders:
    post:
      summary: Place a new order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateOrder"
      responses:
        "201":
          description: Order created
        "400":
          description: Invalid payload
  /orders/{order_id}:
    get:
      summary: Fetch an order by id
      parameters:
        - name: order_id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Order details
        "404":
          description: Order not found`, [
  {},
]);

add(() => `components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        display_name:
          type: string
        created_at:
          type: string
          format: date-time
    Error:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
        request_id:
          type: string
          format: uuid`, [
  {},
]);

add(() => `openapi: 3.0.3
info:
  title: Auth API
  version: 3.0.0
servers:
  - url: https://auth.example.com
security:
  - bearerAuth: []
paths:
  /token:
    post:
      summary: Exchange credentials for a token
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                grant_type:
                  type: string
                  enum: [password, refresh_token, authorization_code]
                username:
                  type: string
                password:
                  type: string
      responses:
        "200":
          description: Token issued`, [
  {},
]);

add(() => `openapi: 3.0.3
info:
  title: Webhook API
  version: 1.0.0
paths:
  /events:
    post:
      summary: Receive a webhook delivery
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                type:
                  type: string
                  enum: [invoice.paid, invoice.failed, customer.created]
                data:
                  type: object
                created:
                  type: integer
      responses:
        "200":
          description: Acknowledged
        "400":
          description: Signature verification failed`, [
  {},
]);

add(() => `openapi: 3.0.3
info:
  title: Weather Service
  version: 0.9.0
paths:
  /v1/forecast:
    get:
      summary: Get forecast for a location
      parameters:
        - name: lat
          in: query
          required: true
          schema:
            type: number
        - name: lon
          in: query
          required: true
          schema:
            type: number
        - name: units
          in: query
          schema:
            type: string
            enum: [metric, imperial]
            default: metric
      responses:
        "200":
          description: Forecast data`, [
  {},
]);

// ===========================================================================
// Application config documents
// ===========================================================================
add(() => `logging:
  level: info
  format: json
  output: stdout
  samplers:
    http: 0.1
    sql: 0.01
  redact:
    - "password"
    - "token"
    - "authorization"`, [
  {},
]);

add(() => `database:
  url: postgres://app:app@db:5432/app
  pool:
    min: 2
    max: 10
    idle_timeout_ms: 30000
  ssl:
    enabled: true
    ca_cert: /etc/ssl/certs/rds-ca.pem
  migrations:
    path: ./migrations
    auto_run: false`, [
  {},
]);

add(() => `features:
  checkout_v2:
    enabled: true
    rollout: 100
  recommendations:
    enabled: true
    rollout: 25
    fallback: "popular"
  dark_mode:
    enabled: false
  bulk_export:
    enabled: true
    max_rows: 50000`, [
  {},
]);

add(() => `auth:
  jwt:
    issuer: auth.example.com
    audience: api.example.com
    access_ttl: 15m
    refresh_ttl: 30d
    algorithm: RS256
    public_key: /etc/keys/jwt.pub
  oauth:
    providers:
      - name: github
        client_id: Iv1.abc123
        scopes: [read:user, user:email]
      - name: google
        client_id: 812345678901-abc.apps.googleusercontent.com
        scopes: [openid, email, profile]
  session:
    cookie_name: session
    secure: true
    same_site: lax`, [
  {},
]);

add(() => `rate_limit:
  global:
    requests: 1000
    window: 1m
  endpoints:
    /api/v1/orders:
      requests: 60
      window: 1m
    /api/v1/search:
      requests: 30
      window: 1m
  strategy: token_bucket
  redis_prefix: rl:`, [
  {},
]);

add(() => `cache:
  engine: redis
  url: redis://redis:6379/0
  ttl: 300
  key_prefix: "v1:"
  invalidation:
    - table: products
      channels: [catalog.changed]
    - table: prices
      channels: [pricing.changed]
  memory:
    enabled: true
    max_entries: 10000
    ttl: 60`, [
  {},
]);

add(() => `smtp:
  host: smtp.sendgrid.net
  port: 587
  username: apikey
  password: SG.smtp-key
  from: no-reply@example.com
  from_name: Acme
  templates:
    dir: ./emails
    default_locale: en
  bcc_audit: ops@example.com`, [
  {},
]);

add(() => `queue:
  provider: rabbitmq
  url: amqp://guest:guest@rabbitmq:5672
  prefetch: 10
  exchanges:
    - name: jobs
      type: topic
  queues:
    - name: emails.send
      routing_key: emails.*
      dlq: emails.send.dlq
    - name: reports.generate
      routing_key: reports.*
      max_length: 1000
  retry:
    max_attempts: 5
    backoff: exponential`, [
  {},
]);

add(() => `search:
  provider: elasticsearch
  url: http://elasticsearch:9200
  index: products
  shards: 3
  replicas: 2
  analyzers:
    default:
      type: custom
      tokenizer: standard
      filters: [lowercase, stop, snowball]
  autocomplete:
    enabled: true
    prefix_length: 3`, [
  {},
]);

add(() => `storage:
  provider: s3
  region: us-east-1
  bucket: acme-assets
  prefix: prod
  public_url: https://cdn.example.com
  upload:
    max_size_mb: 25
    allowed_types:
      - image/jpeg
      - image/png
      - application/pdf
  lifecycle:
    - rule: archive-old
      prefix: logs/
      transition_after_days: 30
      storage_class: STANDARD_IA`, [
  {},
]);

add(() => `i18n:
  default_locale: en-US
  supported_locales:
    - en-US
    - es-ES
    - fr-FR
    - de-DE
    - ja-JP
  fallback: en-US
  plural_rules:
    - locale: "ru|uk"
      rule: russian
  assets:
    dir: ./locales
    format: json`, [
  {},
]);

add(() => `security:
  headers:
    strict_transport_security: max-age=63072000
    content_security_policy: "default-src 'self'"
    x_frame_options: DENY
    referrer_policy: strict-origin-when-cross-origin
  cors:
    allowed_origins:
      - https://app.example.com
    allowed_methods: [GET, POST, PUT, DELETE]
    max_age: 86400
  request_size_limit: 1mb`, [
  {},
]);

add(() => `backup:
  schedule: "30 2 * * *"
  engine: pg_dump
  destinations:
    - type: s3
      bucket: acme-backups
      prefix: postgres
      retention_days: 30
    - type: local
      path: /var/backups
      retention_days: 7
  encryption:
    enabled: true
    key_arn: arn:aws:kms:us-east-1:123456789012:key/abc
  verify:
    restore_test: true
    monthly: true`, [
  {},
]);

add(() => `notifications:
  channels:
    - type: email
      provider: ses
      enabled: true
    - type: slack
      webhook_url: https://hooks.slack.com/services/T000/B000/XXXX
      channel: "#ops"
      enabled: true
    - type: sms
      provider: twilio
      from: "+15005550006"
      enabled: false
  rules:
    - event: payment.failed
      channels: [email, sms]
      cooldown: 1h
    - event: deploy.finished
      channels: [slack]
      cooldown: 0`, [
  {},
]);

add(() => `analytics:
  provider: posthog
  api_key: phc_xxxx
  host: https://us.i.posthog.com
  events:
    track: [pageview, signup, checkout, purchase]
  session_replay:
    enabled: true
    sample_rate: 0.05
  privacy:
    anonymize_ips: true
    respect_dnt: true`, [
  {},
]);

// ===========================================================================
// GitLab CI
// ===========================================================================
add(() => `stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"

test:
  stage: test
  image: node:\${NODE_VERSION}
  script:
    - npm ci
    - npm test
  cache:
    key: npm-cache
    paths:
      - node_modules/

build:
  stage: build
  image: docker:27
  services:
    - docker:27-dind
  script:
    - docker build -t registry.example.com/app:\${CI_COMMIT_SHORT_SHA} .
    - docker push registry.example.com/app:\${CI_COMMIT_SHORT_SHA}`, [
  {},
]);

add(() => `stages:
  - lint
  - test

flake8:
  stage: lint
  image: python:3.12
  script:
    - pip install flake8
    - flake8 app tests

pytest:
  stage: test
  image: python:3.12
  services:
    - postgres:16-alpine
  variables:
    POSTGRES_DB: test
    POSTGRES_USER: test
    POSTGRES_PASSWORD: test
    DATABASE_URL: postgres://test:test@postgres:5432/test
  script:
    - pip install -e ".[dev]"
    - pytest -q`, [
  {},
]);

add(() => `stages:
  - deploy

deploy_staging:
  stage: deploy
  image: alpine:3.20
  before_script:
    - apk add --no-cache openssh-client
    - eval \$(ssh-agent -s)
    - echo "\$SSH_PRIVATE_KEY" | ssh-add -
  script:
    - ssh deploy@staging.example.com "cd /srv/app && git pull && systemctl restart app"
  environment:
    name: staging
  only:
    - main`, [
  {},
]);

add(() => `include:
  - project: "acme/ci-templates"
    file: "/docker.yml"
  - template: "Security/SAST.gitlab-ci.yml"

stages:
  - test
  - security
  - release

test:
  stage: test
  script:
    - go test ./...

release:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli
  rules:
    - if: \$CI_COMMIT_TAG
  script:
    - echo "Releasing \${CI_COMMIT_TAG}"
  release:
    tag_name: \$CI_COMMIT_TAG
    description: "Release \${CI_COMMIT_TAG}"`, [
  {},
]);

add(() => `default:
  image: node:20
  before_script:
    - npm ci

cache:
  key: "\$CI_COMMIT_REF_SLUG"
  paths:
    - node_modules/

workflow:
  rules:
    - if: \$CI_PIPELINE_SOURCE == "merge_request_event"
    - if: \$CI_COMMIT_BRANCH == "main"
    - if: \$CI_COMMIT_TAG

pages:
  script:
    - npm run build
    - mv dist public
  artifacts:
    paths:
      - public
  only:
    - main`, [
  {},
]);

// ===========================================================================
// Serverless
// ===========================================================================
add(() => `service: checkout-api
frameworkVersion: "3"

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    TABLE_NAME: \${self:custom.tableName}
    STRIPE_KEY: \${ssm:/checkout/stripe/key}

functions:
  createCheckout:
    handler: handlers/checkout.create
    events:
      - http:
          path: checkout
          method: post
          cors: true
  webhook:
    handler: handlers/webhook.handle
    events:
      - http:
          path: webhook
          method: post

custom:
  tableName: checkout-\${sls:stage}`, [
  {},
]);

add(() => `service: image-processor

provider:
  name: aws
  runtime: python3.12
  iam:
    role: arn:aws:iam::123456789012:role/lambda-s3-role

functions:
  resize:
    handler: handler.resize
    events:
      - s3:
          bucket: acme-uploads
          event: s3:ObjectCreated:*
          rules:
            - prefix: originals/

resources:
  Resources:
    ThumbnailBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: acme-thumbnails`, [
  {},
]);

add(() => `service: ingest

provider:
  name: aws
  runtime: go1.x

functions:
  consume:
    handler: bin/consume
    events:
      - sqs:
          arn: arn:aws:sqs:us-east-1:123456789012:ingest-queue
          batchSize: 10
      - schedule:
          rate: rate(5 minutes)
          enabled: true`, [
  {},
]);

add(() => `service: notifications

provider:
  name: aws
  runtime: nodejs20.x

functions:
  dispatch:
    handler: index.dispatch
    timeout: 30
    memorySize: 256
    events:
      - sns:
          topicName: user-events
      - sqs:
          arn: !GetAtt Queue.Arn

resources:
  Resources:
    Queue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: dispatch-queue
        VisibilityTimeout: 60`, [
  {},
]);

add(() => `service: api-gateway-auth

provider:
  name: aws
  runtime: nodejs20.x

functions:
  authorizer:
    handler: auth.authorize
    events:
      - http:
          path: authorize
          method: get
  hello:
    handler: handler.hello
    events:
      - http:
          path: hello
          method: get
          authorizer: authorizer`, [
  {},
]);

// ===========================================================================
// Azure Pipelines
// ===========================================================================
add(() => `trigger:
  branches:
    include:
      - main
      - release/*

pool:
  vmImage: ubuntu-latest

variables:
  nodeVersion: "20"

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: \$(nodeVersion)
  - script: npm ci
  - script: npm test
  - task: PublishTestResults@2
    inputs:
      testResultsFiles: "**/junit.xml"
      testRunTitle: "Node tests"`, [
  {},
]);

add(() => `trigger: none

pr:
  branches:
    include:
      - main

pool:
  vmImage: ubuntu-latest

steps:
  - checkout: self
    fetchDepth: 0
  - script: |
      docker build -t app:pr .
      docker run --rm app:pr npm run smoke
  - task: PublishPipelineArtifact@1
    inputs:
      targetPath: .
      artifact: pr-build
      publishLocation: pipeline`, [
  {},
]);

add(() => `trigger:
  branches:
    include:
      - main

pool:
  vmImage: ubuntu-latest

variables:
  - group: production-secrets

stages:
  - stage: Build
    jobs:
      - job: build
        steps:
          - script: npm ci
          - script: npm run build
          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: dist
              ArtifactName: web
  - stage: Deploy
    dependsOn: Build
    jobs:
      - deployment: prod
        environment: production
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "deploying dist to production"`, [
  {},
]);

add(() => `trigger:
  branches:
    include:
      - main

pool:
  vmImage: windows-latest

steps:
  - task: UseDotNet@2
    inputs:
      version: "8.x"
  - script: dotnet restore
  - script: dotnet build --configuration Release
  - script: dotnet test --configuration Release --logger trx
  - task: PublishTestResults@2
    inputs:
      testResultsFormat: VSTest
      testResultsFiles: "**/*.trx"`, [
  {},
]);

// ===========================================================================
// Misc: dev tooling and platform configs
// ===========================================================================
add(() => `name: ml-env
channels:
  - conda-forge
dependencies:
  - python=3.12
  - numpy=1.26.4
  - pandas=2.2.2
  - scikit-learn=1.5.1
  - matplotlib=3.9.0
  - jupyterlab=4.2.0
  - pip
  - pip:
      - torch==2.3.1
      - transformers==4.42.3`, [
  {},
]);

add(() => `site_name: Acme Docs
repo_url: https://github.com/acme/docs
theme:
  name: material
  palette:
    scheme: slate
    primary: indigo
  features:
    - navigation.tabs
    - navigation.top
    - search.suggest
markdown_extensions:
  - admonition
  - pymdownx.highlight
  - pymdownx.superfences
nav:
  - Home: index.md
  - Guides:
      - Getting started: guides/getting-started.md
      - Deployment: guides/deployment.md
  - API: api.md`, [
  {},
]);

add(() => `http:
  routers:
    web:
      rule: "Host(\`app.example.com\`)"
      service: app-svc
      tls:
        certResolver: letsencrypt
    api:
      rule: "Host(\`api.example.com\`) && PathPrefix(\`/v1\`)"
      service: api-svc
      middlewares:
        - api-rate-limit
  middlewares:
    api-rate-limit:
      rateLimit:
        average: 100
        burst: 50
  services:
    app-svc:
      loadBalancer:
        servers:
          - url: "http://10.0.0.10:8080"
    api-svc:
      loadBalancer:
        servers:
          - url: "http://10.0.0.11:8080"`, [
  {},
]);

add(() => `_format_version: "3.0"
_transform: true

services:
  - name: users-service
    url: http://users-api:8080
    routes:
      - name: users-route
        paths:
          - /users
        methods: [GET, POST]
        strip_path: true
  - name: payments-service
    url: http://payments-api:8080
    routes:
      - name: payments-route
        paths:
          - /payments
        methods: [GET, POST, PUT]

plugins:
  - name: rate-limiting
    config:
      minute: 120
      policy: local
  - name: cors
    config:
      origins:
        - https://app.example.com`, [
  {},
]);

add(() => `homeassistant:
  name: Home
  latitude: 51.5074
  longitude: -0.1278
  unit_system: metric
  time_zone: Europe/London

default_config:

sensor:
  - platform: template
    sensors:
      kitchen_temp_c:
        value_template: "{{ states('sensor.kitchen_temperature') | float | round(1) }}"
        unit_of_measurement: "°C"

automation:
  - alias: Turn on porch light at dusk
    trigger:
      platform: sun
      event: sunset
    action:
      service: light.turn_on
      target:
        entity_id: light.porch`, [
  {},
]);

add(() => `version: 2.1

orbs:
  node: circleci/node@5.2.0
  docker: circleci/docker@2.7.0

jobs:
  build:
    docker:
      - image: cimg/node:20.12
    steps:
      - checkout
      - node/install-packages
      - run: npm run build
      - persist_to_workspace:
          root: .
          paths:
            - dist

workflows:
  version: 2
  ci:
    jobs:
      - build
      - test:
          requires:
            - build`, [
  {},
]);

add(() => `kind: pipeline
type: docker
name: default

steps:
  - name: install
    image: node:20
    commands:
      - npm ci
  - name: test
    image: node:20
    commands:
      - npm test
  - name: publish
    image: plugins/docker
    settings:
      repo: registry.example.com/app
      tags: latest
    when:
      branch:
        - main

trigger:
  event:
    - push
    - tag`, [
  {},
]);

add(() => `repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
  - repo: https://github.com/psf/black
    rev: 24.4.2
    hooks:
      - id: black
        language_version: python3.12
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.5.2
    hooks:
      - id: ruff
        args: [--fix]`, [
  {},
]);

add(() => `family: ecs-task
networkMode: awsvpc
requiresCompatibilities:
  - FARGATE
cpu: "512"
memory: "1024"
executionRoleArn: arn:aws:iam::123456789012:role/ecs-exec
containerDefinitions:
  - name: api
    image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/api:latest
    portMappings:
      - containerPort: 8080
    environment:
      - name: NODE_ENV
        value: production
    logConfiguration:
      logDriver: awslogs
      options:
        awslogs-group: /ecs/api
        awslogs-region: us-east-1
        awslogs-stream-prefix: api`, [
  {},
]);

add(() => `index_patterns:
  - "logs-*"

template:
  settings:
    number_of_shards: 2
    number_of_replicas: 1
    analysis:
      analyzer:
        email_analyzer:
          type: custom
          tokenizer: uax_url_email
          filter: [lowercase]
  mappings:
    properties:
      timestamp:
        type: date
      level:
        type: keyword
      message:
        type: text
      service:
        type: keyword
      request_id:
        type: keyword`, [
  {},
]);

add(() => `version: 1

formatters:
  json:
    type: json
  text:
    type: text

inputs:
  systemd:
    type: systemd
    tag: "*"

transforms:
  normalize:
    type: remap
    inputs: [systemd]
    source: |
      .parsed = parse_json!(.message) ?? {}

sinks:
  loki:
    type: loki
    inputs: [normalize]
    endpoint: http://loki:3100
    labels:
      host: "{{ host }}"
      unit: "{{ unit }}"`, [
  {},
]);

add(() => `kind: ConfigMap
apiVersion: v1
metadata:
  name: envoy
data:
  envoy.yaml: |
    static_resources:
      listeners:
        - name: main
          address:
            socket_address:
              address: 0.0.0.0
              port_value: 10000
          filter_chains:
            - filters:
                - name: envoy.filters.network.http_connection_manager
                  typed_config:
                    "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                    stat_prefix: ingress_http
                    route_config:
                      virtual_hosts:
                        - name: backend
                          domains: ["*"]
                          routes:
                            - match: {prefix: "/"}
                              route: {cluster: service_a}
                    http_filters:
                      - name: envoy.filters.http.router`, [
  {},
]);

add(() => `version: "3.8"

services:
  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: app_test
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
  mailpit:
    image: axllent/mailpit:v1.18
    ports:
      - "1025:1025"
      - "8025:8025"`, [
  {},
]);

add(() => `cron:
  - name: sync_inventory
    schedule: "*/15 * * * *"
    command: inventory-sync
    retries: 3
    timeout_seconds: 120
  - name: purge_sessions
    schedule: "0 4 * * *"
    command: session-cleanup
    retries: 1
  - name: weekly_report
    schedule: "0 9 * * 1"
    command: send-report --format pdf
    retries: 5
    timeout_seconds: 600`, [
  {},
]);

add(() => `ingress:
  - name: web
    service: web
    port: 80
    tls:
      enabled: true
      cert_manager: true
    annotations:
      nginx.ingress.kubernetes.io/proxy-body-size: 50m
  - name: api
    service: api
    port: 8080
    path: /api`, [
  {},
]);

add(() => `service:
  name: frontend
  url: https://frontend.example.com
  upstream:
    - url: https://api.example.com
      weight: 80
    - url: https://api-backup.example.com
      weight: 20
  health_check:
    path: /healthz
    interval: 10s
    timeout: 3s
    unhealthy_threshold: 3
  retries:
    attempts: 2
    statuses: [502, 503, 504]`, [
  {},
]);

add(() => `cluster:
  name: staging
  region: us-west-2
  version: "1.30"
  node_groups:
    - name: general
      instance_types: [t3.medium, t3.large]
      min_size: 1
      max_size: 4
      desired_size: 2
      labels:
        role: general
    - name: gpu
      instance_types: [g5.xlarge]
      min_size: 0
      max_size: 2
      desired_size: 0
      taints:
        - key: nvidia.com/gpu
          value: "true"
          effect: NoSchedule`, [
  {},
]);

add(() => `project:
  name: mobile-app
  environments:
    - name: development
      auto_deploy: true
      branch: develop
    - name: staging
      auto_deploy: true
      branch: main
    - name: production
      auto_deploy: false
      branch: main
      approvals: 2
  deploy:
    strategy: rolling
    timeout: 20m
    healthcheck: /healthz
  rollback:
    enabled: true
    automatic: true`, [
  {},
]);

add(() => `apiVersion: v1
kind: Pod
metadata:
  name: kubectl-debug
  labels:
    app: debugger
spec:
  containers:
    - name: kubectl
      image: bitnami/kubectl:1.30
      command: ["sleep", "infinity"]
      env:
        - name: KUBECONFIG
          value: /workspace/kubeconfig
      volumeMounts:
        - name: kube
          mountPath: /workspace
  volumes:
    - name: kube
      configMap:
        name: admin-kubeconfig`, [
  {},
]);

// ===========================================================================
// GitOps CRDs (Prometheus Operator, cert-manager, external-secrets, Flux,
// Argo, Tekton, Istio, CNPG, Strimzi, Velero, Kyverno ...)
// ===========================================================================
add(({ svc, path }) => `apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ${svc}-monitor
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: ${svc}
  endpoints:
    - port: metrics
      interval: 30s
      path: ${path}
      honorLabels: true`, [
  { svc: 'api', path: '/metrics' },
  { svc: 'worker', path: '/metrics' },
]);

add(({ host }) => `apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: app-tls
  namespace: apps
spec:
  secretName: app-tls-secret
  dnsNames:
    - ${host}
    - www.${host}
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer`, [
  { host: 'app.example.com' },
  { host: 'portal.example.org' },
]);

add(({ name, key }) => `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: ${name}
  namespace: apps
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: ${name}
  data:
    - secretKey: ${key}
      remoteRef:
        key: secret/${name}
        property: ${key}`, [
  { name: 'db-credentials', key: 'password' },
  { name: 'stripe-keys', key: 'secret-key' },
]);

add(({ name, chart, ver }) => `apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: ${name}
  namespace: apps
spec:
  interval: 5m
  chart:
    spec:
      chart: ${chart}
      version: "${ver}"
      sourceRef:
        kind: HelmRepository
        name: acme-charts
        namespace: flux-system
  values:
    replicaCount: 3
    image:
      tag: "1.12.0"
    ingress:
      enabled: true`, [
  { name: 'api', chart: 'api', ver: '3.2.0' },
  { name: 'cron-jobs', chart: 'cronjob', ver: '1.8.4' },
]);

add(() => `apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 10m
  path: ./clusters/prod/apps
  prune: true
  sourceRef:
    kind: GitRepository
    name: infra
  postBuild:
    substitute:
      env: prod
      image_tag: "1.12.0"`, [
  {},
]);

add(() => `apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: nightly-etl-
spec:
  entrypoint: main
  templates:
    - name: main
      steps:
        - - name: extract
            template: extract
        - - name: load
            template: load
    - name: extract
      container:
        image: ghcr.io/acme/extract:1.1.0
        args: ["--date", "{{workflow.creationTimestamp}}"]
    - name: load
      container:
        image: ghcr.io/acme/load:1.1.0`, [
  {},
]);

add(() => `apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: build-deploy
spec:
  params:
    - name: version
      type: string
  tasks:
    - name: build-image
      taskRef:
        name: buildah
      params:
        - name: IMAGE
          value: registry.example.com/app:$(params.version)
    - name: deploy
      taskRef:
        name: kubectl-apply
      runAfter:
        - build-image
      params:
        - name: MANIFEST
          value: deploy.yaml`, [
  {},
]);

add(() => `apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: checkout
spec:
  hosts:
    - checkout.example.com
  http:
    - match:
        - uri:
            prefix: /api
      route:
        - destination:
            host: checkout-api
            port:
              number: 8080
      timeout: 5s
      retries:
        attempts: 3
        perTryTimeout: 2s`, [
  {},
]);

add(() => `apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-canary
spec:
  hosts:
    - api.example.com
  http:
    - route:
        - destination:
            host: api
            subset: stable
          weight: 90
        - destination:
            host: api
            subset: canary
          weight: 10`, [
  {},
]);

add(() => `apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: api
spec:
  host: api
  subsets:
    - name: stable
      labels:
        version: v1
    - name: canary
      labels:
        version: v2
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL`, [
  {},
]);

add(({ name, size }) => `apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: ${name}
spec:
  instances: 3
  storage:
    size: ${size}
  postgresql:
    parameters:
      shared_buffers: "512MB"
      max_connections: "200"
  backup:
    barmanObjectStore:
      destinationPath: s3://acme-backups/postgres
      walArchiver: true`, [
  { name: 'main', size: '100Gi' },
  { name: 'reporting', size: '250Gi' },
]);

add(() => `apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: events-cluster
spec:
  kafka:
    replicas: 3
    storage:
      type: jbod
      volumes:
        - id: 0
          type: persistent-claim
          size: 500Gi
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
  zookeeper:
    replicas: 3
    storage:
      type: persistent-claim
      size: 50Gi
  entityOperator:
    topicOperator: {}`, [
  {},
]);

add(() => `apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-cluster
spec:
  schedule: "0 3 * * *"
  template:
    includedNamespaces:
      - apps
      - data
    storageLocation: default
    ttl: 720h
    defaultVolumesToFsBackup: true`, [
  {},
]);

add(() => `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-team-label
      match:
        any:
          - resources:
              kinds:
                - Deployment
      validate:
        message: "resource must include the team label"
        pattern:
          metadata:
            labels:
              team: "?*"`, [
  {},
]);

add(() => `apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: api-keys
  namespace: apps
spec:
  encryptedData:
    secret-key: AgBy3i4OJSWK+PiTySYZZA9rO43cGDEq
  template:
    metadata:
      name: api-keys
      namespace: apps
    type: Opaque`, [
  {},
]);

add(() => `apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg}] {
          required := input.parameters.labels[_]
          provided := input.review.object.metadata.labels
          not required in provided
          msg := sprintf("missing required label: %v", [required])
        }`, [
  {},
]);

add(() => `apiVersion: linkerd.io/v1alpha2
kind: ServiceProfile
metadata:
  name: api.default.svc.cluster.local
  namespace: default
spec:
  routes:
    - name: GET /api/v1/orders
      condition:
        method: GET
        pathRegex: /api/v1/orders
      responseClasses:
        - condition:
            status:
              range:
                min: 200
                max: 299
          isFailure: false`, [
  {},
]);

add(() => `apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: infra
  namespace: flux-system
spec:
  interval: 5m
  url: https://github.com/acme/infra
  ref:
    branch: main
  secretRef:
    name: flux-system
  ignore: |
    /*
    !/clusters/prod`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: metrics
spec:
  replicas: 1
  selector:
    matchLabels:
      app: metrics
  template:
    metadata:
      labels:
        app: metrics
    spec:
      containers:
        - name: kube-state-metrics
          image: registry.k8s.io/kube-state-metrics:v2.12.0
          ports:
            - containerPort: 8080
        - name: node-exporter
          image: prom/node-exporter:v1.8.2
          ports:
            - containerPort: 9100`, [
  {},
]);

// ===========================================================================
// More Docker Compose
// ===========================================================================
add(() => `services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.1
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
  kafka:
    image: confluentinc/cp-kafka:7.6.1
    ports:
      - "9092:9092"
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper`, [
  {},
]);

add(() => `services:
  kafka:
    image: apache/kafka:3.7.1
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@localhost:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1`, [
  {},
]);

add(() => `services:
  keycloak:
    image: quay.io/keycloak/keycloak:24.0.4
    command: start-dev
    ports:
      - "8080:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://db:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak`, [
  {},
]);

add(() => `services:
  vault:
    image: hashicorp/vault:1.17.2
    ports:
      - "8200:8200"
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: root-token
      VAULT_DEV_LISTEN_ADDRESS: 0.0.0.0:8200
    cap_add:
      - IPC_LOCK`, [
  {},
]);

add(() => `services:
  jaeger:
    image: jaegertracing/all-in-one:1.58.0
    ports:
      - "16686:16686"
      - "4317:4317"
      - "4318:4318"
    environment:
      COLLECTOR_OTLP_ENABLED: "true"
      JAEGER_SAMPLER_TYPE: probabilistic
      JAEGER_SAMPLER_PARAM: "0.1"`, [
  {},
]);

add(() => `services:
  clickhouse:
    image: clickhouse/clickhouse-server:24.6
    ports:
      - "8123:8123"
      - "9000:9000"
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    volumes:
      - ch-data:/var/lib/clickhouse
volumes:
  ch-data: {}`, [
  {},
]);

add(() => `services:
  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: localdev
    volumes:
      - mongo-data:/data/db
  mongo-express:
    image: mongo-express:1.0.2
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_URL: mongodb://root:localdev@mongo:27017
      ME_CONFIG_BASICAUTH: "false"
volumes:
  mongo-data: {}`, [
  {},
]);

add(() => `services:
  nginx-proxy:
    image: nginxproxy/nginx-proxy:1.6
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - certs:/etc/nginx/certs
    environment:
      DEFAULT_HOST: app.example.com
  app:
    image: node:20-slim
    environment:
      VIRTUAL_HOST: app.example.com
      VIRTUAL_PORT: "3000"
volumes:
  certs: {}`, [
  {},
]);

add(() => `services:
  app:
    image: node:20-slim
    working_dir: /srv/app
    volumes:
      - .:/srv/app
    command: npm run dev
    environment:
      NODE_ENV: development
      DATABASE_URL: sqlite:///srv/app/dev.db
    ports:
      - "3000:3000"`, [
  {},
]);

add(() => `services:
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.14.1
    command: server --host 0.0.0.0 --port 5000 --backend-store-uri postgresql://mlflow:mlflow@db:5432/mlflow --default-artifact-root s3://mlflow-artifacts
    ports:
      - "5000:5000"
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mlflow
      POSTGRES_USER: mlflow
      POSTGRES_PASSWORD: mlflow`, [
  {},
]);

add(() => `services:
  scheduler:
    image: apache/airflow:2.9.2
    command: scheduler
    environment:
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@db:5432/airflow
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
    volumes:
      - ./dags:/opt/airflow/dags
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: airflow
      POSTGRES_USER: airflow
      POSTGRES_PASSWORD: airflow`, [
  {},
]);

// ===========================================================================
// More GitHub Actions
// ===========================================================================
add(() => `name: terraform

on:
  push:
    branches: [main]
    paths: ["infra/**"]

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.9.0"
      - run: terraform init
      - run: terraform fmt -check -recursive
      - run: terraform validate
      - run: terraform plan -out=tfplan
      - uses: actions/upload-artifact@v4
        with:
          name: tfplan
          path: tfplan`, [
  {},
]);

add(() => `name: terraform-apply

on:
  workflow_dispatch:

jobs:
  apply:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform init
      - run: terraform apply -auto-approve
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}`, [
  {},
]);

add(() => `name: goreleaser

on:
  push:
    tags: ["v*"]

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-go@v5
        with:
          go-version: "1.22"
      - uses: goreleaser/goreleaser-action@v6
        with:
          distribution: goreleaser
          version: latest
          args: release --clean
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`, [
  {},
]);

add(() => `name: stale

on:
  schedule:
    - cron: "30 1 * * *"

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          days-before-issue-stale: 60
          days-before-issue-close: 14
          stale-issue-label: stale
          exempt-issue-labels: pinned,security
          stale-pr-label: stale-pr
          days-before-pr-stale: 30
          days-before-pr-close: 7`, [
  {},
]);

add(() => `name: hugo

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          fetch-depth: 0
      - uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: "0.129.0"
          extended: true
      - run: hugo --minify
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public`, [
  {},
]);

add(() => `name: android

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - uses: gradle/actions/setup-gradle@v3
      - run: ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: apk
          path: app/build/outputs/apk/debug/`, [
  {},
]);

add(() => `name: protobuf

on:
  pull_request:
    paths: ["proto/**"]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: bufbuild/buf-setup-action@v1
      - run: buf lint
      - run: buf generate
      - run: git diff --exit-code`, [
  {},
]);

add(() => `name: fly

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: \${{ secrets.FLY_API_TOKEN }}`, [
  {},
]);

add(() => `name: coverage

on:
  push:
    branches: [main]

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/`, [
  {},
]);

add(() => `name: release-drafter

on:
  push:
    branches: [main]
  pull_request_target:
    types: [opened, reopened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  draft:
    runs-on: ubuntu-latest
    steps:
      - uses: release-drafter/release-drafter@v6
        with:
          config-name: release-drafter.yml
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`, [
  {},
]);

add(() => `name: scout

on:
  push:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/scout-action@v1
        with:
          command: cves
          image: ghcr.io/acme/app:latest
          only-severities: critical,high
          sarif-file: scout.sarif
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: scout.sarif`, [
  {},
]);

add(() => `name: auto-assign

on:
  pull_request_target:
    types: [opened, ready_for_review]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: kentaro-m/auto-assign-action@v2
        with:
          repo-token: \${{ secrets.GITHUB_TOKEN }}
          configuration-path: .github/auto-assign.yml
          add-reviewers: true
          number-of-reviewers: 2`, [
  {},
]);

// ===========================================================================
// More Kubernetes
// ===========================================================================
add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/api:1.4.0
          envFrom:
            - configMapRef:
                name: api-config
            - secretRef:
                name: api-secrets
          ports:
            - containerPort: 8080`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.27-alpine
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 10"]
          terminationGracePeriodSeconds: 30`, [
  {},
]);

add(() => `apiVersion: v1
kind: Pod
metadata:
  name: gpu-job
spec:
  nodeSelector:
    node.kubernetes.io/instance-type: g5.xlarge
  tolerations:
    - key: nvidia.com/gpu
      operator: Exists
      effect: NoSchedule
  containers:
    - name: trainer
      image: ghcr.io/acme/trainer:2.0.0
      resources:
        limits:
          nvidia.com/gpu: "1"`, [
  {},
]);

add(() => `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  annotations:
    nginx.ingress.kubernetes.io/limit-rps: "20"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "10"
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 8080`, [
  {},
]);

add(() => `apiVersion: v1
kind: Service
metadata:
  name: external-api
spec:
  type: ExternalName
  externalName: api.external.example.com`, [
  {},
]);

add(() => `apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432`, [
  {},
]);

add(() => `apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: internal
spec:
  controller: k8s.io/ingress-nginx
  parameters:
    apiGroup: k8s.example.com
    kind: IngressParameters
    name: internal-lb`, [
  {},
]);

add(() => `apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 100000
globalDefault: false
description: "Used for latency-sensitive workloads."`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 6
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: api
      containers:
        - name: api
          image: ghcr.io/acme/api:1.4.0`, [
  {},
]);

add(() => `apiVersion: v1
kind: Secret
metadata:
  name: regcred
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: eyJhdXRocyI6eyJyZWdpc3RyeS5leGFtcGxlLmNvbSI6e319fQ==`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchLabels:
                  app: api
              topologyKey: kubernetes.io/hostname
      containers:
        - name: api
          image: ghcr.io/acme/api:1.4.0`, [
  {},
]);

add(() => `apiVersion: v1
kind: ConfigMap
metadata:
  name: init-script
data:
  init.sql: |
    CREATE TABLE IF NOT EXISTS app_events (
      id BIGSERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX idx_app_events_type ON app_events (event_type);`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7.4-alpine
          command: ["redis-server"]
          args: ["--appendonly", "yes", "--save", "900 1", "--maxmemory", "256mb"]
          ports:
            - containerPort: 6379
          volumeMounts:
            - name: data
              mountPath: /data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: redis-data`, [
  {},
]);


// ===========================================================================
// More dbt
// ===========================================================================
add(() => `version: 2

sources:
  - name: stripe
    database: analytics
    schema: stripe
    tables:
      - name: charges
        description: Stripe charges
        columns:
          - name: id
            tests: [unique, not_null]
          - name: amount
      - name: refunds
        freshness:
          warn_after: {count: 12, period: hour}
          error_after: {count: 48, period: hour}`, [
  {},
]);

add(() => `version: 2

metrics:
  - name: revenue
    label: Revenue
    model: ref('fct_orders')
    description: Total order revenue.
    calculation_method: sum
    expression: total_amount
    timestamp: created_at
    time_grains: [day, week, month]
    dimensions:
      - country
      - region`, [
  {},
]);

add(() => `version: 2

metrics:
  - name: new_customers
    label: New Customers
    model: ref('dim_customers')
    description: Count of customers created in the period.
    calculation_method: count_distinct
    expression: customer_id
    timestamp: created_at
    time_grains: [day, week]
    filters:
      - field: is_test_account
        operator: '='
        value: 'false'`, [
  {},
]);

add(() => `version: 2

tests:
  - name: assert_order_amount_positive
    description: Order totals must always be positive.
  - name: assert_charge_matches_invoice
    description: Stripe charges must reference a valid invoice.
  - name: assert_sku_not_blank`, [
  {},
]);

add(() => `version: 2

exposures:
  - name: executive_kpis
    label: Executive KPIs
    type: dashboard
    url: https://superset.example.com/dashboards/7
    depends_on:
      - ref("fct_orders")
      - metric("revenue")
    owner:
      name: Exec Reporting
      email: exec-reporting@example.com`, [
  {},
]);

add(() => `name: analytics
version: "1.0.0"
config-version: 2

profile: analytics

models:
  marts:
    +materialized: table
    +incremental_strategy: delete+insert
    +pre-hook: "{{ log('building marts', info=True) }}"

on-run-end:
  - "{{ log('Run complete', info=True) }}"`, [
  {},
]);

// ===========================================================================
// More Ansible
// ===========================================================================
add(() => `- name: Run application container
  hosts: app
  become: true
  tasks:
    - name: Pull latest image
      docker_image:
        name: registry.example.com/app:latest
        source: pull

    - name: Start container
      docker_container:
        name: app
        image: registry.example.com/app:latest
        state: started
        restart_policy: unless-stopped
        ports:
          - "8080:8080"
        env:
          NODE_ENV: production`, [
  {},
]);

add(() => `- name: Install Node.js
  hosts: all
  become: true
  tasks:
    - name: Add NodeSource repository
      apt_repository:
        repo: "deb https://deb.nodesource.com/node_20.x noble main"
        state: present

    - name: Install Node.js
      apt:
        name: nodejs
        state: latest
        update_cache: true`, [
  {},
]);

add(() => `- name: Deploy from git
  hosts: app
  become: true
  vars:
    repo: https://github.com/acme/api.git
    dest: /srv/api
  tasks:
    - name: Clone repository
      git:
        repo: "{{ repo }}"
        dest: "{{ dest }}"
        version: main
        force: true

    - name: Install dependencies
      pip:
        requirements: "{{ dest }}/requirements.txt"
        virtualenv: "{{ dest }}/venv"

    - name: Restart service
      service:
        name: api
        state: restarted`, [
  {},
]);

add(() => `- name: Issue Let's Encrypt certificate
  hosts: proxy
  become: true
  tasks:
    - name: Install certbot
      apt:
        name: certbot
        state: present

    - name: Obtain certificate
      command: certbot certonly --webroot -w /var/www/html -d app.example.com -d www.app.example.com --non-interactive --agree-tos -m admin@example.com
      args:
        creates: /etc/letsencrypt/live/app.example.com/fullchain.pem`, [
  {},
]);

add(() => `- name: Configure log rotation
  hosts: all
  become: true
  tasks:
    - name: Write logrotate config
      copy:
        dest: /etc/logrotate.d/app
        content: |
          /var/log/app/*.log {
            daily
            rotate 14
            compress
            delaycompress
            missingok
            notifempty
            create 0640 www-data www-data
          }`, [
  {},
]);

add(() => `- name: Load secrets into app config
  hosts: app
  become: true
  vars_files:
    - secrets/vault.yml
  tasks:
    - name: Write env file
      template:
        src: templates/app.env.j2
        dest: /etc/app.env
        owner: www-data
        mode: "0600"
      notify: restart app

  handlers:
    - name: restart app
      systemd:
        name: app
        state: restarted`, [
  {},
]);

// ===========================================================================
// More observability
// ===========================================================================
add(() => `scrape_configs:
  - job_name: blackbox
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - https://app.example.com
          - https://api.example.com/healthz
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115`, [
  {},
]);

add(() => `modules:
  tcp_connect:
    prober: tcp
    timeout: 5s
    tcp:
      query_response:
        - expect: "^220"
  icmp:
    prober: icmp
    timeout: 5s`, [
  {},
]);

add(() => `scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: "true"
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\\d+)?;(\\d+)
        replacement: $1:$2
        target_label: __address__`, [
  {},
]);

add(() => `apiVersion: 1

providers:
  - name: dashboards
    orgId: 1
    folder: acme
    type: file
    disableDeletion: false
    updateIntervalSeconds: 60
    options:
      path: /var/lib/grafana/dashboards`, [
  {},
]);

add(() => `apiVersion: 1

providers:
  - name: ops
    orgId: 2
    folder: ""
    type: file
    disableDeletion: true
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/ops`, [
  {},
]);

add(() => `storage:
  type: s3
  config:
    bucket: acme-metrics
    endpoint: s3.amazonaws.com
    region: us-east-1

compactor:
  retention_resolution_raw: 30d
  retention_resolution_5m: 180d
  retention_resolution_1h: 1y

query:
  stores:
    - thanos-store:10901
    - thanos-sidecar:10901`, [
  {},
]);

add(() => `server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        grpc: {}
        http: {}

storage:
  trace:
    backend: s3
    s3:
      bucket: acme-traces
      endpoint: s3.amazonaws.com
      region: us-east-1

compactor:
  compaction:
    block_retention: 336h`, [
  {},
]);

add(() => `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 5s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_mib: 512

exporters:
  otlp:
    endpoint: jaeger:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]`, [
  {},
]);

add(() => `receivers:
  otlp:
    protocols:
      grpc: {}
  prometheus:
    config:
      scrape_configs:
        - job_name: app
          static_configs:
            - targets: ["app:8080"]

exporters:
  prometheusremotewrite:
    endpoint: http://thanos-receive:19291/api/v1/receive
  debug:
    verbosity: basic

service:
  pipelines:
    metrics:
      receivers: [prometheus, otlp]
      exporters: [prometheusremotewrite]`, [
  {},
]);

// ===========================================================================
// More application configs
// ===========================================================================
add(() => `tracing:
  provider: jaeger
  endpoint: http://jaeger:4317
  service_name: api
  sampler:
    type: probabilistic
    param: 0.1
  propagation: [w3c, b3]
  tags:
    environment: production
    region: eu-west-1`, [
  {},
]);

add(() => `websocket:
  path: /ws
  heartbeat_interval: 30s
  max_message_size: 64kb
  origins:
    - https://app.example.com
  backpressure:
    max_connections: 10000
    max_pending_messages: 100`, [
  {},
]);

add(() => `webhooks:
  - name: slack-alerts
    url: https://hooks.slack.com/services/T000/B000/XXXX
    events:
      - deploy.finished
      - incident.opened
    secret: whsec_slack
    retries: 5
  - name: zapier-crm
    url: https://hooks.zapier.com/hooks/catch/12345/abc/
    events:
      - customer.created
      - invoice.paid
    retries: 3`, [
  {},
]);

add(() => `push_notifications:
  apns:
    enabled: true
    key_id: ABC123DEFG
    team_id: TEAMID1234
    bundle_id: com.example.app
    environment: production
  fcm:
    enabled: true
    project_id: acme-mobile
    priority: high
  topics:
    - name: order_updates
      sound: default
      badge: true`, [
  {},
]);

add(() => `storage_presign:
  url_ttl: 15m
  max_file_size_mb: 100
  allowed_buckets:
    - uploads
    - avatars
  policies:
    - bucket: uploads
      prefix: invoices/
      content_types: [application/pdf]
      max_files: 10`, [
  {},
]);

add(() => `image_processing:
  formats: [webp, avif]
  quality: 80
  sizes:
    - name: thumbnail
      width: 200
      height: 200
      fit: cover
    - name: card
      width: 640
      height: 360
      fit: cover
    - name: full
      width: 1920
      height: 1080
      fit: inside
  cdn: https://img.example.com
  cache_ttl: 86400`, [
  {},
]);

add(() => `experiments:
  - key: checkout_redesign
    buckets:
      - variant: control
        weight: 50
      - variant: treatment
        weight: 50
  - key: search_ranking_v2
    buckets:
      - variant: control
        weight: 80
      - variant: neural
        weight: 20
  evaluation: deterministic
  salt: experiment-salt-v1`, [
  {},
]);

add(() => `billing:
  provider: stripe
  plans:
    - id: starter
      price_monthly: 1200
      price_yearly: 12000
      limits:
        projects: 3
        seats: 5
      support: standard
    - id: pro
      price_monthly: 4900
      price_yearly: 49000
      limits:
        projects: 20
        seats: 25
      support: priority
    - id: enterprise
      custom: true
      support: dedicated
  trial_days: 14
  proration: true`, [
  {},
]);

add(() => `seo:
  title_template: "%s | Acme"
  description_max: 160
  default_locale: en_US
  sitemap:
    enabled: true
    max_urls: 50000
    priorities:
      home: 1.0
      product: 0.8
      blog: 0.6
  robots:
    allow_all: true
    disallow:
      - /admin/
      - /cart/`, [
  {},
]);

add(() => `session:
  store: redis
  ttl: 7d
  cookie:
    name: sid
    http_only: true
    secure: true
    same_site: lax
    domain: .example.com
  rolling: true
  absolute_timeout: 30d`, [
  {},
]);

add(() => `graphql:
  path: /graphql
  introspection: true
  playground: false
  depth_limit: 12
  complexity:
    max: 1000
    cost:
      scalar: 1
      object: 2
      list: 5
  persisted_queries:
    enabled: true
    ttl: 30d`, [
  {},
]);

add(() => `quotas:
  default:
    requests_per_minute: 300
    storage_gb: 10
    api_calls_per_day: 50000
  tiers:
    free:
      requests_per_minute: 60
      storage_gb: 1
    pro:
      requests_per_minute: 600
      storage_gb: 50
  enforcement: hard
  notify_at_percent: 80`, [
  {},
]);

add(() => `audit_log:
  enabled: true
  events:
    - auth.login
    - auth.login_failed
    - user.updated
    - billing.changed
    - settings.changed
  retention_days: 90
  sink: s3://acme-audit-logs
  redact_fields:
    - password
    - api_key`, [
  {},
]);

add(() => `uploads:
  max_size_mb: 50
  concurrent: 3
  chunk_size_mb: 5
  allowed_extensions:
    - .pdf
    - .docx
    - .xlsx
    - .png
  scan:
    enabled: true
    provider: clamav
  quarantine_prefix: quarantine/`, [
  {},
]);

// ===========================================================================
// More CI: CircleCI, Azure, Drone, GitLab
// ===========================================================================
add(() => `version: 2.1

jobs:
  test:
    docker:
      - image: cimg/python:3.12
        environment:
          DATABASE_URL: postgres://app:app@localhost:5432/app
      - image: cimg/postgres:16.2
        environment:
          POSTGRES_DB: app
          POSTGRES_USER: app
          POSTGRES_PASSWORD: app
    steps:
      - checkout
      - run: pip install -e ".[dev]"
      - run: pytest

workflows:
  main:
    jobs:
      - test`, [
  {},
]);

add(() => `version: 2.1

jobs:
  deploy:
    docker:
      - image: cimg/base:2024.06
    steps:
      - checkout
      - run:
          name: Deploy to production
          command: |
            curl -X POST https://api.vercel.com/v13/deployments \
              -H "Authorization: Bearer $VERCEL_TOKEN" \
              --data-urlencode "name=acme-web"

workflows:
  release:
    jobs:
      - deploy:
          filters:
            branches:
              only: main`, [
  {},
]);

add(() => `version: 2.1

jobs:
  build:
    docker:
      - image: cimg/node:20.12
    steps:
      - checkout
      - run: npm ci
      - run: npm run build
      - store_artifacts:
          path: dist
          destination: web-dist

workflows:
  ci:
    jobs:
      - build`, [
  {},
]);

add(() => `trigger:
  tags:
    include:
      - v*

pool:
  vmImage: ubuntu-latest

steps:
  - task: UseDotNet@2
    inputs:
      version: "8.x"
  - script: dotnet publish -c Release -o out
  - task: AzureCLI@2
    inputs:
      azureSubscription: acme-prod
      scriptType: bash
      scriptLocation: inlineScript
      inlineScript: az webapp deploy --name acme-api --src-path out.zip`, [
  {},
]);

add(() => `kind: pipeline
type: docker
name: build

steps:
  - name: test
    image: golang:1.22
    commands:
      - go test ./...
  - name: publish
    image: plugins/gcr
    settings:
      repo: acme-project/api
      registry: gcr.io
      tags:
        - latest
        - "\${DRONE_COMMIT_SHA:0:8}"
    when:
      branch: main

trigger:
  event: push`, [
  {},
]);

add(() => `stages:
  - review
  - cleanup

review_app:
  stage: review
  image: node:20
  script:
    - echo "Deploying review app for MR \${CI_MERGE_REQUEST_IID}"
    - curl -X POST https://platform.example.com/deploy \
        -H "Authorization: Bearer \${REVIEW_TOKEN}" \
        -d "ref=\${CI_COMMIT_REF_SLUG}"
  environment:
    name: review/\${CI_COMMIT_REF_SLUG}
    url: https://\${CI_COMMIT_REF_SLUG}.review.example.com
    on_stop: stop_review_app
  rules:
    - if: \$CI_MERGE_REQUEST_ID

stop_review_app:
  stage: cleanup
  script:
    - curl -X DELETE https://platform.example.com/deploy \
        -H "Authorization: Bearer \${REVIEW_TOKEN}" \
        -d "ref=\${CI_COMMIT_REF_SLUG}"
  environment:
    name: review/\${CI_COMMIT_REF_SLUG}
    action: stop
  rules:
    - if: \$CI_MERGE_REQUEST_ID
      when: manual`, [
  {},
]);

// ===========================================================================
// Final batch: more compose, workflows, k8s, app configs
// ===========================================================================
add(() => `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_NAME: app_dev
      DB_USER: app
      DB_PASSWORD: localdev
    volumes:
      - .:/app
      - /app/node_modules
  db:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: app_dev
      MYSQL_USER: app
      MYSQL_PASSWORD: localdev
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - mysql-dev:/var/lib/mysql
volumes:
  mysql-dev: {}`, [
  {},
]);

add(() => `services:
  web:
    image: node:20-slim
    working_dir: /srv/app
    command: npm run dev -- --host 0.0.0.0
    volumes:
      - ./web:/srv/app
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app`, [
  {},
]);

add(() => `services:
  traefik:
    image: traefik:v3.1
    command:
      - --providers.docker
      - --api.insecure=true
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
  whoami:
    image: traefik/whoami:v1.10
    labels:
      - "traefik.http.routers.whoami.rule=Host(\`whoami.localhost\`)"`, [
  {},
]);

add(() => `services:
  primary:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    volumes:
      - pg-data:/var/lib/postgresql/data
  documents:
    image: mongo:7.0
    environment:
      MONGO_INITDB_DATABASE: app_docs
    volumes:
      - mongo-data:/data/db
volumes:
  pg-data: {}
  mongo-data: {}`, [
  {},
]);

add(() => `services:
  promtail:
    image: grafana/promtail:3.0.0
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./promtail.yaml:/etc/promtail/config.yaml:ro
    command: -config.file=/etc/promtail/config.yaml
  loki:
    image: grafana/loki:3.0.0
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
  grafana:
    image: grafana/grafana:11.1.0
    ports:
      - "3001:3000"
    environment:
      GF_SERVER_ROOT_URL: http://localhost:3001`, [
  {},
]);

add(() => `services:
  app:
    image: python:3.12-slim
    working_dir: /srv/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - .:/srv/app
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://app:app@db:5432/app
      PYTHONPATH: /srv/app
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app`, [
  {},
]);

add(() => `name: ci-matrix

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20, 22]
        os: [ubuntu-latest, macos-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test`, [
  {},
]);

add(() => `name: pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4`, [
  {},
]);

add(() => `name: lock

on:
  schedule:
    - cron: "0 * * * *"

permissions:
  issues: write
  pull-requests: write

jobs:
  lock:
    runs-on: ubuntu-latest
    steps:
      - uses: dessant/lock-threads@v5
        with:
          process-only: issues
          issue-inactive-days: 30
          issue-lock-reason: resolved
          issue-comment: "This issue has been automatically locked."`, [
  {},
]);

add(() => `name: audit

on:
  schedule:
    - cron: "0 6 * * 1"
  workflow_dispatch:

jobs:
  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm audit --audit-level=high
        continue-on-error: false`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: api
          image: ghcr.io/acme/api:1.4.0
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: [ALL]
          ports:
            - containerPort: 8080`, [
  {},
]);

add(() => `apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
  ports:
    - port: 8080
      targetPort: 8080`, [
  {},
]);

add(() => `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 12
  metrics:
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80`, [
  {},
]);

add(() => `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ws-ingress
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-http-version: "1.1"
spec:
  rules:
    - host: ws.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: gateway
                port:
                  number: 8080`, [
  {},
]);

add(() => `sso:
  provider: saml
  idp_metadata_url: https://login.example.com/saml/metadata
  entity_id: https://app.example.com/saml
  acs_url: https://app.example.com/saml/acs
  attribute_mapping:
    email: urn:oid:1.2.840.113549.1.9.1
    first_name: givenName
    last_name: sn
  auto_provision: true`, [
  {},
]);

add(() => `mfa:
  enabled: true
  methods:
    - type: totp
      issuer: Acme
      algorithm: SHA1
      digits: 6
      period: 30
    - type: sms
      provider: twilio
  recovery_codes:
    count: 10
    length: 12
  enforce_for_roles:
    - admin
    - billing`, [
  {},
]);

add(() => `maintenance:
  enabled: false
  message: "We are performing scheduled maintenance."
  allowlist:
    - 10.0.0.0/8
    - 192.168.1.5
  cache_control: no-store
  status_page: https://status.example.com`, [
  {},
]);

add(() => `feature_flags:
  - key: new_onboarding
    enabled: true
    targeting:
      - rule: employees
        rollout: 100
      - rule: beta_users
        rollout: 50
  - key: instant_checkout
    enabled: false
  - key: dark_mode
    enabled: true
    rollout: 25
  evaluation_endpoint: https://flags.example.com/evaluate`, [
  {},
]);

add(() => `sources:
  - name: snowflake
    database: ANALYTICS
    schema: RAW
    tables:
      - name: WEB_EVENTS
        columns:
          - name: EVENT_ID
            tests: [unique, not_null]
      - name: SESSIONS
        loaded_at_field: LOADED_AT
        freshness:
          warn_after: {count: 6, period: hour}`, [
  {},
]);

add(() => `- name: Install PostgreSQL
  hosts: db
  become: true
  tasks:
    - name: Install packages
      apt:
        name:
          - postgresql
          - postgresql-contrib
        state: present
        update_cache: true

    - name: Enable service
      systemd:
        name: postgresql
        enabled: true
        state: started

    - name: Create application user
      become_user: postgres
      postgresql_user:
        name: app
        password: "{{ app_db_password }}"
        role_attr_flags: LOGIN`, [
  {},
]);

add(() => `- name: Prepare swap on small instances
  hosts: all
  become: true
  when: ansible_memtotal_mb < 2048
  tasks:
    - name: Create swap file
      command: fallocate -l 2G /swapfile
      args:
        creates: /swapfile

    - name: Set permissions
      file:
        path: /swapfile
        mode: "0600"

    - name: Enable swap
      command: mkswap /swapfile && swapon /swapfile
      args:
        creates: /dev/shm/swap-enabled

    - name: Make persistent
      lineinfile:
        path: /etc/fstab
        line: "/swapfile none swap sw 0 0"`, [
  {},
]);

add(() => `service: ledger

provider:
  name: aws
  runtime: nodejs20.x

functions:
  onEvent:
    handler: handlers/event.consume
    events:
      - stream:
          type: dynamodb
          arn: arn:aws:dynamodb:us-east-1:123456789012:table/ledger/stream/2024-01-01
          batchSize: 100
          startingPosition: LATEST`, [
  {},
]);

add(() => `stages:
  - release

semantic-release:
  stage: release
  image: node:20
  script:
    - npm ci
    - npx semantic-release
  rules:
    - if: \$CI_COMMIT_BRANCH == "main"`, [
  {},
]);

add(() => `services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      redis:
        condition: service_healthy
    environment:
      REDIS_URL: redis://redis:6379/0
      RATE_LIMIT_ENABLED: "true"
  redis:
    image: redis:7.4-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3`, [
  {},
]);

add(() => `name: swift

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: swift-actions/setup-swift@v2
        with:
          swift-version: "5.10"
      - run: swift build
      - run: swift test`, [
  {},
]);

add(() => `name: dotnet

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "8.x"
      - run: dotnet restore
      - run: dotnet build --configuration Release --no-restore
      - run: dotnet test --no-build --configuration Release`, [
  {},
]);

add(() => `apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
spec:
  replicas: 2
  selector:
    matchLabels:
      app: worker
  template:
    metadata:
      labels:
        app: worker
    spec:
      containers:
        - name: worker
          image: ghcr.io/acme/worker:2.1.0
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: "1"
              memory: 1Gi
          env:
            - name: QUEUE_NAME
              value: high-priority`, [
  {},
]);

add(() => `endpoints:
  /health:
    enabled: true
    response_timeout_ms: 500
  /metrics:
    enabled: true
    auth: internal
  /debug:
    enabled: false
  /swagger:
    enabled: true
    path: /docs`, [
  {},
]);

add(() => `exports:
  formats: [csv, json, parquet]
  max_rows: 1000000
  async:
    enabled: true
    queue: exports.queue
    notification: email
  schedule:
    - name: nightly_sales
      cron: "0 5 * * *"
      format: parquet
      destination: s3://acme-exports/sales`, [
  {},
]);

add(() => `oauth_apps:
  - name: mobile-ios
    client_id: ios_abc123
    redirect_uris:
      - acmeapp://oauth/callback
    scopes: [profile, orders.read]
  - name: mobile-android
    client_id: android_def456
    redirect_uris:
      - https://app.example.com/auth/callback
    scopes: [profile, orders.read, push]
  - name: partner-portal
    client_id: partner_789xyz
    redirect_uris:
      - https://partner.example.com/oauth2/callback
    scopes: [analytics.read]
    confidential: true`, [
  {},
]);

add(() => `image:
  repository: postgres
  tag: "16.3"

auth:
  username: app
  database: app
  existingSecret: pg-secret
  secretKeys:
    userPasswordKey: postgres-password

primary:
  persistence:
    size: 50Gi
    storageClass: standard
  resources:
    requests:
      cpu: 250m
      memory: 512Mi

readReplicas:
  replicaCount: 1
  resources:
    requests:
      cpu: 250m
      memory: 512Mi`, [
  {},
]);

// ===========================================================================
// Write output
// ===========================================================================
if (blocks.length < 300) {
  console.error(`YAML: only ${blocks.length} blocks — need at least 300`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Write output — group blocks into themed files by sniffing their shape.
// ---------------------------------------------------------------------------
const classify = (text) => {
  if (/^(services:|x-common:)/m.test(text)) return 'compose';
  if (/^name: [a-z0-9-]+$/m.test(text) && /\bon:\s*\n/m.test(text) && /^jobs:/m.test(text)) return 'workflows';
  if (/config-version:/m.test(text) || /^version: 2$/m.test(text) || /^packages:/m.test(text)) return 'dbt';
  if (/^apiVersion:/m.test(text)) {
    if (/kind: (Deployment|Service|ConfigMap|Secret|Ingress|CronJob|HorizontalPodAutoscaler|NetworkPolicy|StatefulSet|DaemonSet|Job|Pod|PersistentVolumeClaim|ServiceAccount|RoleBinding)\b/m.test(text)) return 'kubernetes';
    return 'k8s-extra';
  }
  if (/^(replicaCount|nameOverride):/m.test(text) || /^autoscaling:/m.test(text) || /^image:\n\s+repository:/m.test(text) || /^serviceMonitor:/m.test(text) || /^postgresql:/m.test(text)) return 'helm';
  if (/^- name:/m.test(text)) return 'ansible';
  if (/^(global:\n\s+scrape_interval|groups:|apiVersion: 1$|auth_enabled: false|route:\n\s+group_by|service:\n\s+parsers: json|scrape_configs:|modules:|storage:\n\s+type: s3|server:\n\s+http_listen_port: 3200|receivers:\n\s+otlp:)/m.test(text)) return 'monitoring';
  if (/^openapi:/m.test(text) || /^components:\n\s+schemas:/m.test(text)) return 'openapi';
  if (/frameworkVersion/m.test(text) || /^service: (checkout-api|image-processor|ingest|notifications|api-gateway-auth)$/m.test(text)) return 'serverless';
  if (/^trigger:/m.test(text)) return 'azure-pipelines';
  if (/^(stages:|include:|default:|workflow:)/m.test(text)) return 'gitlab-ci';
  if (/^(logging|database|features|auth|rate_limit|cache|smtp|queue|search|storage|i18n|security|backup|notifications|analytics|tracing|websocket|webhooks|push_notifications|storage_presign|image_processing|experiments|billing|seo|session|graphql|quotas|audit_log|uploads):$/m.test(text)) return 'appconfig';
  return 'misc';
};

const grouped = new Map();
for (const b of blocks) {
  const fam = classify(b);
  if (!grouped.has(fam)) grouped.set(fam, []);
  grouped.get(fam).push(b);
}

const CHUNK = 28;
let written = 0;
for (const [fam, list] of grouped) {
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    const name = i === 0 ? `${fam}.yaml` : `${fam}-${i / CHUNK + 1}.yaml`;
    fs.writeFileSync(path.join(OUT, name), chunk.join('\n\n') + '\n', 'utf8');
    written++;
  }
}

console.log(`YAML: wrote ${blocks.length} blocks across ${written} files -> ${OUT}`);
