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

## Visibilidade por canal

Os itens dos JSONs de conteúdo aceitam dois controles independentes:

- `visible`: controla a exibição no site; ausente equivale a `true`.
- `appVisible`: controla a inclusão no conteúdo enviado ao app.

Quando `appVisible` não está presente, ele herda o valor de `visible`. Isso
preserva o comportamento dos registros antigos. Quando está presente, seu valor
tem prioridade para o app:

```json
{
  "visible": false,
  "appVisible": true
}
```

O exemplo acima fica oculto no site e disponível no app. Para conteúdo somente
no site, use `visible: true` e `appVisible: false`.

Para planetas, defina `appVisible` na entrada correspondente de
`kammara_progress.json`. Um valor explícito é independente do progresso:
`true` publica o planeta no app mesmo enquanto ele está em loading no site;
`false` o retira do app mesmo quando o progresso chegou a 100%.

`appComingSoon` controla separadamente a contagem de planetas no dashboard
“Em breve”. Por padrão, `appVisible: false` já oculta o planeta e o anuncia:

```json
{
  "appVisible": false
}
```

Para manter um planeta oculto e secreto, use também `appComingSoon: false`.

As relações continuam registradas nos arquivos autorais. O gerador remove do
JSON final as conexões cujo destino está oculto e as inclui novamente quando o
destino volta a ficar visível.

O contador de personagens “Em breve” é o total autoral menos os personagens
presentes no catálogo publicado. Assim, ocultar um planeta ou personagem
aumenta o saldo futuro e publicá-lo novamente reduz esse saldo. A contagem nunca
ultrapassa o total completo de personagens cadastrados.
