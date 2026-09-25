# Fluxo de imagens e vídeos

As mídias do site usam o bucket `s3://kammara/`. Durante o desenvolvimento,
uma cópia pode ficar em `public/imgs/` para evitar requisições repetidas ao S3.
As pastas sincronizadas são ignoradas pelo Git, mas arquivos antigos que já
eram rastreados continuam rastreados normalmente.

Nunca coloque Access Key ou Secret Access Key no repositório, no `.env.local`
ou na documentação.

## Autenticação

O perfil local usado neste projeto é `kammara-user`:

```bash
aws login --profile kammara-user --region us-east-1
```

Confirme a identidade antes de alterar o bucket:

```bash
aws sts get-caller-identity --profile kammara-user
```

## Usar as mídias locais

No `.env.local`, deixe a variável vazia:

```env
NEXT_PUBLIC_MEDIA_BASE_URL=
```

Baixe ou atualize a cache local sem apagar arquivos:

```bash
aws s3 sync s3://kammara/ public/imgs/ --profile kammara-user
```

Depois de alterar o `.env.local`, reinicie `npm run dev`.

## Usar o S3 diretamente

Para testar o mesmo carregamento usado em produção:

```env
NEXT_PUBLIC_MEDIA_BASE_URL=https://kammara.s3.us-east-1.amazonaws.com/
```

Reinicie o servidor depois da mudança. O ambiente remoto deve continuar com
essa URL configurada.

## Enviar uma imagem nova ou alterada

Prefira enviar um arquivo por vez. Assim, um caminho digitado errado não
publica uma pasta inteira por acidente:

```bash
aws s3 cp \
  public/imgs/art/exemplo.jpg \
  s3://kammara/art/exemplo.jpg \
  --profile kammara-user
```

O caminho depois de `public/imgs/` deve ser igual ao caminho depois de
`s3://kammara/`.

Para enviar uma pasta, simule primeiro:

```bash
aws s3 sync \
  public/imgs/art/minha-pasta/ \
  s3://kammara/art/minha-pasta/ \
  --profile kammara-user \
  --dryrun
```

Revise toda a saída. Se estiver correta, repita sem `--dryrun`:

```bash
aws s3 sync \
  public/imgs/art/minha-pasta/ \
  s3://kammara/art/minha-pasta/ \
  --profile kammara-user
```

## Conferir o resultado

Liste um prefixo do bucket:

```bash
aws s3 ls s3://kammara/art/minha-pasta/ --profile kammara-user
```

Ou confira um arquivo pela URL pública:

```text
https://kammara.s3.us-east-1.amazonaws.com/art/minha-pasta/exemplo.jpg
```

## Auditoria e métricas

As operações de escrita e exclusão em `s3://kammara/` são registradas pelo
CloudTrail `kammara-media-audit`. Leituras públicas não entram no trail, para
evitar volume e custo desnecessários.

Os logs ficam no bucket privado
`s3://kammara-cloudtrail-logs-451633548946-us-east-1/`, com criptografia,
versionamento, bloqueio de acesso público e expiração após 90 dias.

Confira se o trail está ativo:

```bash
aws cloudtrail get-trail-status \
  --name kammara-media-audit \
  --region us-east-1 \
  --profile kammara-user
```

As métricas de requisição do bucket usam a configuração `EntireBucket` e
aparecem no CloudWatch sob o namespace `AWS/S3`. A entrega dessas métricas é
best effort e pode levar alguns minutos.

## Regras de segurança

- Não use `--delete` em `aws s3 sync` durante o trabalho normal.
- Sempre use `--dryrun` antes de sincronizar uma pasta para o S3.
- Não execute `git add -f public/imgs/...`; as mídias devem permanecer fora
  do Git.
- Confira o perfil com `aws sts get-caller-identity` antes de enviar arquivos.
- S3 cobra por armazenamento, requisições e, em alguns casos, transferência.
  Trabalhar com a cache local reduz leituras repetidas durante o desenvolvimento.
- Para auditoria, mantenha CloudTrail Data Events e as métricas do bucket
  habilitados no ambiente AWS.
