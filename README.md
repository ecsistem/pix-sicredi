# PIX Sicredi - API de Integração

API Node.js para integração com o sistema PIX do Sicredi.

## Descrição

Esta API permite a geração e consulta de cobranças PIX através da integração com a API do Sicredi. É construída com Node.js, Express e TypeScript.

## Requisitos

- Node.js >= 18.0.0
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/pix-sicredi.git
cd pix-sicredi
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie uma cópia do arquivo `.env.example` e renomeie para `.env`
   - Preencha as variáveis de ambiente conforme necessário:
     - CLIENT_ID e CLIENT_SECRET fornecidos pelo Sicredi
     - Caminhos para os arquivos de certificado (.cer) e chave privada (.key)

```properties
PORT=3000
NODE_ENV="production" # ou "development"
CLIENT_ID="seu-client-id"
CLIENT_SECRET="seu-client-secret"
CRT_FILE="./config/seu-certificado.cer"
KEY_FILE="./config/sua-chave.key"
PASS="" # senha do certificado, se necessário
```

4. Coloque os arquivos de certificado na pasta `/config`:
   - Arquivo .cer (certificado)
   - Arquivo .key (chave privada)

## Comandos

- **Desenvolvimento**:
  ```bash
  npm run dev
  ```

- **Build**:
  ```bash
  npm run build
  ```

- **Produção**:
  ```bash
  npm start
  ```

## Endpoints da API

### Health Check
```
GET /api/health
```
Retorna o status da API para monitoramento.

### Gerar Cobrança PIX
```
POST /api/pix/gerar
```
Cria uma nova cobrança PIX.

**Corpo da requisição**:
```json
{
  "valor": 99.90
}
```

**Resposta**:
```json
{
  "message": "PIX gerado com sucesso",
  "dados": {
    // Dados retornados pelo Sicredi
  }
}
```

### Consultar Status de Cobrança
```
GET /api/pix/status/:id
```
Consulta o status de uma cobrança pelo ID.

**Resposta**:
```json
{
  "message": "Consulta realizada com sucesso",
  "dados": {
    // Dados de status da cobrança
  }
}
```

## Estrutura do Projeto

```
pix-sicredi/
├── config/                  # Certificados e chaves
│   ├── 01907521000190.cer
│   └── key.key
├── src/                     # Código fonte
│   ├── index.ts             # Arquivo principal
│   ├── service/             # Serviços
│   │   └── PixSicredi.ts    # Implementação da integração com o Sicredi
│   └── config/              # Configurações da aplicação
├── dist/                    # Código compilado (gerado pelo build)
├── .env                     # Variáveis de ambiente
├── .env.example             # Exemplo de variáveis de ambiente
├── package.json             # Dependências e scripts
└── tsconfig.json            # Configuração do TypeScript
```

## Licença

ISC

## Autor

Edson Costa

---

**Notas de Segurança:**
- Nunca compartilhe seus arquivos de certificado, chaves privadas ou credenciais.
- Mantenha seu arquivo `.env` no `.gitignore` para não versioná-lo.
- Em produção, considere usar um gerenciador de secrets para as credenciais.
