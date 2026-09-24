# IDs do conteúdo do Kammara

Os `appId` são identidades permanentes, legíveis e editáveis à mão:

```text
<mundo>-<tipo>-<nome-semantico>
```

Exemplos: `lunnp1-character-eru-rin`, `digg-topic-geografia` e
`triplec-scene-floresta-niul`.

- Use apenas letras minúsculas sem acento, números e hífens.
- Remova acentos e transforme espaços e apóstrofos em hífens.
- Depois de atribuído, preserve o ID mesmo que o título visível mude.
- Em caso de nomes repetidos, acrescente um complemento que diferencie o
  conteúdo, como `palacio-de-node-0-1` e `palacio-de-node-0-3`.
- `relations` deve referenciar estes IDs completos.

Quando um item novo não tem `appId`, `npm run generate-app-content` cria um a
partir do seu nome. Se o resultado colidir com outro item, o comando falha e
pede um ID mais específico.

`app_id_aliases.json` registra a migração dos IDs antigos com hash para os IDs
semânticos. O app deve aplicar esse mapa ao migrar dados ou referências locais
já persistidas.
