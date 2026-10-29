/**
 * Empresa de demonstração: Nuvia, plataforma fictícia de atendimento ao
 * cliente. Tudo aqui é inventado — empresas, pessoas e conversas. Os
 * concorrentes são nomes reais do mercado de atendimento, citados como
 * concorrentes seriam numa reunião de verdade.
 *
 * Cada conta conta uma história, para o radar ter de tudo: conta que piora,
 * conta que melhora, conta saudável com expansão e conta que já decidiu sair.
 * As reuniões de cada conta vão em ordem cronológica, porque a análise de uma
 * reunião usa a memória das anteriores.
 */

export const EMPRESA = 'Nuvia';
export const PESSOA = 'Marina Lopes';

export const CATALOGO = {
  produtos: [
    { nome: 'Nuvia Atende', sinonimos: ['Atende', 'helpdesk'] },
    { nome: 'Nuvia Bot', sinonimos: ['chatbot', 'o bot'] },
    { nome: 'Nuvia Insights', sinonimos: ['Insights', 'painel de indicadores'] },
    { nome: 'Nuvia Voz', sinonimos: ['URA', 'telefonia'] },
  ],
  concorrentes: [
    { nome: 'Zendesk', sinonimos: [] },
    { nome: 'Freshdesk', sinonimos: [] },
    { nome: 'Movidesk', sinonimos: [] },
    { nome: 'Octadesk', sinonimos: [] },
    { nome: 'Blip', sinonimos: [] },
  ],
};

export interface ReuniaoDemo {
  titulo: string;
  tipo: 'customer_success' | 'renovacao' | 'follow_up' | 'reuniao' | 'negociacao' | 'demonstracao';
  data: string;
  texto: string;
}

export interface ContaDemo {
  nome: string;
  segmento: string;
  porte: string;
  valorContrato: number;
  reunioes: ReuniaoDemo[];
}

export const CONTAS: ContaDemo[] = [
  {
    nome: 'Banco Horizonte',
    segmento: 'Serviços financeiros / Fintech',
    porte: 'Grande porte',
    valorContrato: 210_000,
    reunioes: [
      {
        titulo: 'QBR do segundo trimestre',
        tipo: 'customer_success',
        data: '2026-07-14',
        texto: `Marina Lopes: Bom dia, Rodrigo. Obrigada pelo tempo. Aqui na Nuvia a gente preparou o resumo do trimestre, posso começar?
Rodrigo Prado: Bom dia, Marina. Pode sim.
Marina Lopes: O volume de atendimento no Nuvia Atende cresceu trinta por cento e o tempo médio de primeira resposta caiu.
Rodrigo Prado: Os números estão bons. O que me preocupa é a integração com o core bancário. Desde maio o webhook cai pelo menos uma vez por semana.
Marina Lopes: Entendo. O chamado está com o time de engenharia.
Rodrigo Prado: Está, mas o suporte demora para responder. Abrimos três chamados e só um teve retorno.
Marina Lopes: Vou acompanhar pessoalmente e te dou um retorno até sexta-feira.
Rodrigo Prado: Combinado. Preciso disso resolvido antes da auditoria de setembro.`,
      },
      {
        titulo: 'Follow-up — instabilidade da integração',
        tipo: 'follow_up',
        data: '2026-08-26',
        texto: `Marina Lopes: Oi, Rodrigo. Aqui na Nuvia a engenharia fechou o diagnóstico e eu queria atualizar você sobre a integração.
Rodrigo Prado: Marina, vou ser direto. É a terceira vez que o webhook derruba a fila em horário de pico. Isso virou problema recorrente.
Marina Lopes: Eu sei, e peço desculpas. A engenharia identificou a causa e o ajuste sai na próxima versão.
Rodrigo Prado: A próxima versão era para agosto. Vocês não entregaram o que prometeram.
Marina Lopes: Você tem razão. Posso colocar um engenheiro dedicado com vocês por duas semanas.
Rodrigo Prado: Ajuda, mas eu vou escalar isso internamente. A diretoria já me perguntou se faz sentido manter a ferramenta.
Marina Lopes: Entendo. Me deixa marcar uma reunião com o nosso diretor de produto ainda esta semana.
Rodrigo Prado: Marque. E me mande por escrito o plano de correção até quarta-feira.`,
      },
      {
        titulo: 'Reunião com a diretoria — renovação',
        tipo: 'renovacao',
        data: '2026-10-21',
        texto: `Marina Lopes: Boa tarde, Rodrigo, boa tarde, Helena. Obrigada por receberem a gente.
Helena Castro: Boa tarde. Vou ser objetiva, Marina. Nós perdemos a paciência com a instabilidade.
Rodrigo Prado: O plano de correção resolveu metade. A fila ainda caiu duas vezes em outubro.
Helena Castro: Nós vamos abrir uma concorrência para o atendimento no ano que vem. Já estamos cotando com a Zendesk e conversando com outros fornecedores.
Marina Lopes: Entendo a decisão. O que precisaria acontecer para a Nuvia continuar nessa disputa?
Helena Castro: Estabilidade comprovada por sessenta dias e um SLA com multa no contrato.
Marina Lopes: Consigo levar a proposta de SLA para a diretoria e te mandar até o dia cinco.
Helena Castro: Mande. Mas hoje, sinceramente, não temos confiança na plataforma.`,
      },
    ],
  },
  {
    nome: 'Rede Bem Estar Farmácias',
    segmento: 'Varejo / Farmácias',
    porte: 'Médio porte',
    valorContrato: 96_000,
    reunioes: [
      {
        titulo: 'Check-in mensal',
        tipo: 'customer_success',
        data: '2026-08-05',
        texto: `Marina Lopes: Oi, Patrícia, tudo bem? Como estão as lojas com o Nuvia Bot?
Patrícia Almeida: Oi, Marina. O bot ajudou no WhatsApp, isso eu reconheço.
Marina Lopes: Que bom. E o atendimento humano?
Patrícia Almeida: Esse está pior. O suporte demora e o chamado sem resposta virou rotina. Tenho chamado aberto há doze dias.
Marina Lopes: Vou verificar agora esse chamado e te retorno hoje ainda.
Patrícia Almeida: Por favor. As gerentes de loja estão reclamando comigo.`,
      },
      {
        titulo: 'Conversa de renovação',
        tipo: 'renovacao',
        data: '2026-10-08',
        texto: `Marina Lopes: Oi, Patrícia. O contrato vence em dezembro e eu queria conversar sobre a renovação.
Patrícia Almeida: Marina, nós estamos avaliando alternativas. A Octadesk apresentou semana passada e o preço é bem menor.
Marina Lopes: Entendo. O que pesou mais na comparação?
Patrícia Almeida: Preço e suporte. O custo não compensa se eu continuo esperando dias por resposta.
Marina Lopes: Posso propor um suporte prioritário sem custo adicional no primeiro semestre.
Patrícia Almeida: Do jeito que está hoje, não vamos renovar. Se a proposta mudar isso, eu olho.
Marina Lopes: Te mando a proposta até sexta-feira.`,
      },
    ],
  },
  {
    nome: 'Lume Educação',
    segmento: 'Educação',
    porte: 'Médio porte',
    valorContrato: 54_000,
    reunioes: [
      {
        titulo: 'Onboarding — fechamento',
        tipo: 'customer_success',
        data: '2026-07-02',
        texto: `Marina Lopes: Oi, Bruno. Com isso a gente fecha o onboarding do Nuvia Atende. Ficou alguma dúvida?
Bruno Teixeira: Oi, Marina. A configuração ficou boa. O desafio agora é a equipe usar.
Marina Lopes: Posso fazer um treinamento extra com os atendentes da secretaria.
Bruno Teixeira: Seria ótimo. Eles ainda têm o hábito antigo.
Marina Lopes: Combinado, mando duas datas até amanhã.`,
      },
      {
        titulo: 'Revisão de uso — adoção baixa',
        tipo: 'customer_success',
        data: '2026-09-16',
        texto: `Marina Lopes: Oi, Bruno. Olhei os dados de uso e só seis dos vinte atendentes entram na plataforma.
Bruno Teixeira: É, eu vi. A secretaria voltou para a planilha. Dizem que é mais rápido.
Marina Lopes: Entendo. O que está deixando o Nuvia Atende mais lento para eles?
Bruno Teixeira: A tela de matrícula tem muitos campos. E ninguém usa o painel de indicadores.
Marina Lopes: Dá para simplificar o formulário. Posso fazer isso com você na semana que vem.
Bruno Teixeira: Pode ser. Mas a direção já pediu para reduzir licenças na próxima fatura, de vinte para oito.
Marina Lopes: Antes de reduzir, me dá trinta dias para a gente ajustar o fluxo?
Bruno Teixeira: Trinta dias eu consigo segurar.`,
      },
    ],
  },
  {
    nome: 'TransLog Cargas',
    segmento: 'Logística / Transporte',
    porte: 'Grande porte',
    valorContrato: 120_000,
    reunioes: [
      {
        titulo: 'Alinhamento — expansão para filiais',
        tipo: 'negociacao',
        data: '2026-08-12',
        texto: `Marina Lopes: Oi, Fernanda. Como foi a implantação do Nuvia Atende na matriz?
Fernanda Ribeiro: Foi bem, Marina. O time gostou. Queremos levar para as quatro filiais.
Marina Lopes: Ótimo. Posso te mandar a proposta de expansão com o Nuvia Voz para a central telefônica.
Fernanda Ribeiro: Manda. Só que o financeiro vai querer comparar. Estão comparando com a Movidesk no preço por agente.
Marina Lopes: Entendo. A gente compete bem quando entra a telefonia integrada.
Fernanda Ribeiro: Pode ser. Mas preço vai pesar muito.`,
      },
      {
        titulo: 'Negociação da expansão',
        tipo: 'negociacao',
        data: '2026-10-01',
        texto: `Marina Lopes: Oi, Fernanda. Conseguiu olhar a proposta?
Fernanda Ribeiro: Olhei. Está cara, Marina. A Movidesk veio vinte por cento abaixo.
Marina Lopes: A diferença está no Nuvia Voz, que eles não têm nativo.
Fernanda Ribeiro: Eu sei, mas o diretor financeiro só olha o número. E o relatório de SLA ainda dá erro de exportação, é um problema recorrente.
Marina Lopes: Esse erro sai na versão de novembro. Posso propor um desconto escalonado por filial.
Fernanda Ribeiro: Manda a proposta revisada até quinta. A decisão é no comitê do dia vinte.`,
      },
    ],
  },
  {
    nome: 'Casa Verde Móveis',
    segmento: 'Varejo / Móveis',
    porte: 'Médio porte',
    valorContrato: 72_000,
    reunioes: [
      {
        titulo: 'Check-in trimestral',
        tipo: 'customer_success',
        data: '2026-07-22',
        texto: `Marina Lopes: Oi, Gustavo. Como está o atendimento pós-venda com o Nuvia Atende?
Gustavo Moreira: Oi, Marina. No geral, bem. O tempo de resposta caiu bastante.
Marina Lopes: Que bom. Alguma dor nova?
Gustavo Moreira: A integração com a transportadora. O status da entrega não atualiza no ticket e o cliente liga de novo.
Marina Lopes: Vou abrir o chamado com prioridade e te mando o número hoje.
Gustavo Moreira: Beleza.`,
      },
      {
        titulo: 'Follow-up — integração de entregas',
        tipo: 'follow_up',
        data: '2026-09-30',
        texto: `Marina Lopes: Oi, Gustavo. Queria saber se a integração de entregas normalizou.
Gustavo Moreira: Melhorou, mas já tivemos o mesmo problema várias vezes. No geral gosto da Nuvia, mas isso precisa fechar.
Marina Lopes: Justo. A correção definitiva sai em outubro.
Gustavo Moreira: Ok. E eu queria entender o Nuvia Bot para a época de Black Friday.
Marina Lopes: Posso fazer uma demonstração do bot na semana que vem.
Gustavo Moreira: Pode marcar. Se resolver o volume de novembro, faz sentido.`,
      },
    ],
  },
  {
    nome: 'AgroSul Cooperativa',
    segmento: 'Agronegócio',
    porte: 'Grande porte',
    valorContrato: 150_000,
    reunioes: [
      {
        titulo: 'Reunião de crise — atendimento ao cooperado',
        tipo: 'customer_success',
        data: '2026-06-18',
        texto: `Marina Lopes: Boa tarde, Sérgio. Sei que o momento é delicado.
Sérgio Bastos: É, Marina. A safra começou e o atendimento travou. Estou insatisfeito.
Marina Lopes: Entendo. O que mais pesou?
Sérgio Bastos: A URA derruba ligação e o cooperado não consegue falar com ninguém. Já estamos avaliando alternativas.
Marina Lopes: Vou colocar um time de engenharia dedicado nisso hoje.
Sérgio Bastos: Preciso de resposta em uma semana.`,
      },
      {
        titulo: 'Acompanhamento — correção da URA',
        tipo: 'follow_up',
        data: '2026-08-04',
        texto: `Marina Lopes: Oi, Sérgio. Como ficou a URA depois da correção?
Sérgio Bastos: Bem melhor, Marina. Desde julho não caiu mais nenhuma ligação.
Marina Lopes: Que ótimo. E a fila no Nuvia Atende?
Sérgio Bastos: Normalizou. O pessoal da central voltou a confiar na ferramenta.
Marina Lopes: Fico feliz. Quer que eu prepare um painel no Nuvia Insights para a diretoria?
Sérgio Bastos: Quero. A diretoria gosta de número.`,
      },
      {
        titulo: 'QBR do terceiro trimestre',
        tipo: 'customer_success',
        data: '2026-10-15',
        texto: `Marina Lopes: Bom dia, Sérgio. Trouxe o resumo do trimestre.
Sérgio Bastos: Bom dia. Vi o painel do Nuvia Insights, ficou excelente. A diretoria elogiou.
Marina Lopes: Que bom. O tempo de espera caiu de oito para dois minutos.
Sérgio Bastos: Isso mudou o atendimento ao cooperado. Estou muito satisfeito.
Marina Lopes: Para a próxima safra, faz sentido colocar o Nuvia Bot no WhatsApp?
Sérgio Bastos: Faz. Quero testar com uma regional primeiro. Me manda uma proposta até o fim do mês.`,
      },
    ],
  },
  {
    nome: 'Clínica Sorriso Pleno',
    segmento: 'Saúde / Odontologia',
    porte: 'Pequeno porte',
    valorContrato: 36_000,
    reunioes: [
      {
        titulo: 'Check-in — agendamentos',
        tipo: 'customer_success',
        data: '2026-08-20',
        texto: `Marina Lopes: Oi, Camila. Como está o Nuvia Bot nos agendamentos?
Camila Duarte: Oi, Marina. Está ótimo. Metade das marcações já sai pelo bot.
Marina Lopes: Que notícia boa. E as faltas?
Camila Duarte: Caíram com a confirmação automática. As recepcionistas adoraram.
Marina Lopes: Quer levar o bot para a nova unidade?
Camila Duarte: Quero. A unidade nova abre em novembro. Me manda a proposta.`,
      },
      {
        titulo: 'Expansão — nova unidade',
        tipo: 'negociacao',
        data: '2026-10-22',
        texto: `Marina Lopes: Oi, Camila. A proposta da nova unidade ficou boa para vocês?
Camila Duarte: Ficou. O valor cabe no orçamento. Pode seguir.
Marina Lopes: Ótimo. Mando o contrato hoje e agendo a implantação para a primeira semana de novembro.
Camila Duarte: Perfeito. Estou muito satisfeita com a Nuvia.`,
      },
    ],
  },
  {
    nome: 'Pixel Moda',
    segmento: 'E-commerce / Moda',
    porte: 'Pequeno porte',
    valorContrato: 48_000,
    reunioes: [
      {
        titulo: 'Check-in mensal',
        tipo: 'customer_success',
        data: '2026-09-09',
        texto: `Marina Lopes: Oi, Larissa. Tudo certo com as trocas e devoluções no Nuvia Atende?
Larissa Kim: Tudo certo, Marina. O fluxo de troca ficou muito mais rápido.
Marina Lopes: Que bom. Vocês já olharam o Nuvia Insights?
Larissa Kim: Ainda não. Mas eu queria entender quais produtos geram mais reclamação.
Marina Lopes: É exatamente o que o painel mostra. Posso fazer uma demonstração na semana que vem.
Larissa Kim: Pode marcar.`,
      },
      {
        titulo: 'Demonstração do Nuvia Insights',
        tipo: 'demonstracao',
        data: '2026-10-14',
        texto: `Marina Lopes: Oi, Larissa. Montei o painel com os dados de vocês dos últimos três meses.
Larissa Kim: Nossa, isso é muito bom. Dá para ver que a calça jeans gera metade das trocas.
Marina Lopes: Exato. Dá para filtrar por tamanho e por motivo.
Larissa Kim: Isso resolve uma briga antiga com o time de produto. Quero contratar.
Marina Lopes: Ótimo. Te mando a proposta até amanhã.`,
      },
    ],
  },
];
