import type { ConsumptionPoint, MeterPoint } from './aquasenseTypes';

function build24hSeries(basePerBlock: number, multiplier = 1): ConsumptionPoint[] {
  const labels = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
  const weights = [0.25, 0.2, 0.22, 0.95, 1.55, 1.1, 1.25, 0.95, 0.85, 1.45, 1.35, 0.55];
  return labels.map((label, i) => {
    const habitualLiters = Math.round(basePerBlock * weights[i]);
    const liters = Math.round(habitualLiters * multiplier);
    return { label, liters, habitualLiters };
  });
}

function build7dSeries(dailyHabitual: number, variance: number[]): ConsumptionPoint[] {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  return days.map((label, i) => ({
    label,
    habitualLiters: dailyHabitual,
    liters: Math.round(dailyHabitual * (variance[i] ?? 1)),
  }));
}

function build30dSeries(dailyHabitual: number, trendMultiplier = 1): ConsumptionPoint[] {
  const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  const factors = [0.96, 1.02, 0.98, trendMultiplier];
  return weeks.map((label, i) => ({
    label,
    habitualLiters: dailyHabitual * 7,
    liters: Math.round(dailyHabitual * 7 * factors[i]),
  }));
}

export const INITIAL_METER_POINTS: MeterPoint[] = [
  {
    id: 'meter-01',
    code: 'AQ-LDA-014',
    name: 'Residência Talatona — Lote B12',
    location: 'Talatona, Luanda',
    bairro: 'Talatona',
    municipality: 'Talatona',
    province: 'Luanda',
    category: 'Residências e famílias',
    connectivity: 'Wi-Fi',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: 'Hoje, 14:32:10',
    totalVolumeM3: 142.84,
    dailyLiters: 432.4,
    habitualDailyLiters: 460,
    currentFlowLpm: 1.4,
    pressureBar: 2.62,
    valveClosed: false,
    wastedLitersEstimate: 0,
    continuousFlowMinutes: 12,
    continuousFlowSeconds: 742,
    quality: {
      ph: 7.2,
      turbidityNtu: 0.9,
      tdsPpm: 218,
      temperatureC: 23.4,
    },
    series24h: build24hSeries(43, 0.94),
    series7d: build7dSeries(460, [0.95, 0.98, 0.92, 1.04, 0.97, 1.08, 0.94]),
    series30d: build30dSeries(460, 0.94),
    activeScenario: 'normal',
  },
  {
    id: 'meter-huila-01',
    code: 'AQ-HLA-021',
    name: 'Residência Bairro Comercial — Casa 18',
    location: 'Bairro Comercial, Lubango, Huíla',
    bairro: 'Bairro Comercial',
    municipality: 'Lubango',
    province: 'Huíla',
    category: 'Residências e famílias',
    connectivity: 'Wi-Fi',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: 'Hoje, 14:32:14',
    totalVolumeM3: 118.62,
    dailyLiters: 394.2,
    habitualDailyLiters: 420,
    currentFlowLpm: 1.25,
    pressureBar: 2.74,
    valveClosed: false,
    wastedLitersEstimate: 0,
    continuousFlowMinutes: 9,
    continuousFlowSeconds: 564,
    quality: {
      ph: 7.1,
      turbidityNtu: 0.7,
      tdsPpm: 192,
      temperatureC: 20.8,
    },
    series24h: build24hSeries(39, 0.94),
    series7d: build7dSeries(420, [0.93, 0.96, 1.01, 0.98, 0.95, 1.05, 0.94]),
    series30d: build30dSeries(420, 0.95),
    activeScenario: 'normal',
  },
  {
    id: 'meter-huila-02',
    code: 'AQ-HLA-045',
    name: 'Residência Tchioco — Zona Sul',
    location: 'Bairro Tchioco, Lubango, Huíla',
    bairro: 'Tchioco',
    municipality: 'Lubango',
    province: 'Huíla',
    category: 'Residências e famílias',
    connectivity: 'GSM/4G',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: 'Hoje, 14:31:52',
    totalVolumeM3: 204.35,
    dailyLiters: 618.5,
    habitualDailyLiters: 430,
    currentFlowLpm: 2.4,
    pressureBar: 2.08,
    valveClosed: false,
    wastedLitersEstimate: 174,
    continuousFlowMinutes: 142,
    continuousFlowSeconds: 8535,
    quality: {
      ph: 7.2,
      turbidityNtu: 1.1,
      tdsPpm: 205,
      temperatureC: 21.2,
    },
    series24h: build24hSeries(40, 1.44),
    series7d: build7dSeries(430, [0.98, 1.02, 1.05, 1.18, 1.32, 1.41, 1.44]),
    series30d: build30dSeries(430, 1.32),
    activeScenario: 'fuga',
  },
  {
    id: 'meter-huila-03',
    code: 'AQ-HLA-112',
    name: 'Condomínio Nossa Senhora do Monte',
    location: 'Nossa Senhora do Monte, Lubango, Huíla',
    bairro: 'Nossa Senhora do Monte',
    municipality: 'Lubango',
    province: 'Huíla',
    category: 'Condomínios',
    connectivity: 'GSM/4G',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: 'Hoje, 14:32:08',
    totalVolumeM3: 1842.9,
    dailyLiters: 5840,
    habitualDailyLiters: 6050,
    currentFlowLpm: 4.1,
    pressureBar: 2.68,
    valveClosed: false,
    wastedLitersEstimate: 0,
    continuousFlowMinutes: 18,
    continuousFlowSeconds: 1094,
    quality: {
      ph: 7.3,
      turbidityNtu: 0.8,
      tdsPpm: 185,
      temperatureC: 19.6,
    },
    series24h: build24hSeries(545, 0.96),
    series7d: build7dSeries(6050, [0.97, 1.01, 0.95, 0.99, 1.03, 1.08, 0.96]),
    series30d: build30dSeries(6050, 0.97),
    activeScenario: 'normal',
  },
  {
    id: 'meter-02',
    code: 'AQ-LDA-082',
    name: 'Condomínio Jardim de Rosas — Bloco C',
    location: 'Camama, Belas, Luanda',
    bairro: 'Camama',
    municipality: 'Belas',
    province: 'Luanda',
    category: 'Condomínios',
    connectivity: 'GSM/4G',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: 'Hoje, 14:30:44',
    totalVolumeM3: 2480.52,
    dailyLiters: 9420,
    habitualDailyLiters: 6400,
    currentFlowLpm: 4.2,
    pressureBar: 2.02,
    valveClosed: false,
    wastedLitersEstimate: 385,
    continuousFlowMinutes: 195,
    continuousFlowSeconds: 11718,
    quality: {
      ph: 7.4,
      turbidityNtu: 1.4,
      tdsPpm: 265,
      temperatureC: 24.0,
    },
    series24h: build24hSeries(580, 1.47),
    series7d: build7dSeries(6400, [1.01, 0.99, 1.04, 1.12, 1.28, 1.41, 1.47]),
    series30d: build30dSeries(6400, 1.38),
    activeScenario: 'fuga',
  },
  {
    id: 'meter-03',
    code: 'AQ-LDA-109',
    name: 'Escola Primária N.º 1042',
    location: 'Maianga, Luanda, Luanda',
    bairro: 'Maianga',
    municipality: 'Luanda',
    province: 'Luanda',
    category: 'Escolas e universidades',
    connectivity: 'Wi-Fi',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: 'Hoje, 14:28:15',
    totalVolumeM3: 890.21,
    dailyLiters: 2180,
    habitualDailyLiters: 2250,
    currentFlowLpm: 2.1,
    pressureBar: 2.54,
    valveClosed: false,
    wastedLitersEstimate: 0,
    continuousFlowMinutes: 20,
    continuousFlowSeconds: 1212,
    quality: {
      ph: 7.1,
      turbidityNtu: 1.2,
      tdsPpm: 240,
      temperatureC: 23.8,
    },
    series24h: build24hSeries(210, 0.97),
    series7d: build7dSeries(2250, [1.02, 0.98, 0.95, 1.01, 0.99, 0.45, 0.35]),
    series30d: build30dSeries(2250, 0.97),
    activeScenario: 'normal',
  },
  {
    id: 'meter-04',
    code: 'AQ-LDA-205',
    name: 'Centro de Saúde Municipal',
    location: 'Kilamba, Belas, Luanda',
    bairro: 'Kilamba',
    municipality: 'Belas',
    province: 'Luanda',
    category: 'Instituições públicas',
    connectivity: 'GSM/4G',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: 'Hoje, 14:31:02',
    totalVolumeM3: 1645.05,
    dailyLiters: 4120,
    habitualDailyLiters: 3900,
    currentFlowLpm: 3.1,
    pressureBar: 2.42,
    valveClosed: false,
    wastedLitersEstimate: 0,
    continuousFlowMinutes: 25,
    continuousFlowSeconds: 1528,
    quality: {
      ph: 7.0,
      turbidityNtu: 3.1,
      tdsPpm: 410,
      temperatureC: 24.6,
    },
    series24h: build24hSeries(360, 1.06),
    series7d: build7dSeries(3900, [0.98, 1.01, 1.03, 1.05, 1.02, 0.99, 1.06]),
    series30d: build30dSeries(3900, 1.04),
    activeScenario: 'normal',
  },
  {
    id: 'meter-05',
    code: 'AQ-LDA-318',
    name: 'Chafariz Comunitário Viana Sul',
    location: 'Viana Sul, Viana, Luanda',
    bairro: 'Viana Sul',
    municipality: 'Viana',
    province: 'Luanda',
    category: 'Comunidades',
    connectivity: 'GSM/4G',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: 'Hoje, 14:25:39',
    totalVolumeM3: 3210.42,
    dailyLiters: 7640,
    habitualDailyLiters: 7400,
    currentFlowLpm: 6.4,
    pressureBar: 2.31,
    valveClosed: false,
    wastedLitersEstimate: 0,
    continuousFlowMinutes: 35,
    continuousFlowSeconds: 2110,
    quality: {
      ph: 5.9,
      turbidityNtu: 6.2,
      tdsPpm: 580,
      temperatureC: 26.1,
    },
    series24h: build24hSeries(690, 1.03),
    series7d: build7dSeries(7400, [1.0, 0.97, 1.04, 1.01, 0.99, 1.08, 1.03]),
    series30d: build30dSeries(7400, 1.02),
    activeScenario: 'qualidade',
  },
  {
    id: 'meter-06',
    code: 'AQ-LDA-401',
    name: 'Ponto de Entrega Sectorial Benfica Norte',
    location: 'Benfica Norte, Talatona, Luanda',
    bairro: 'Benfica Norte',
    municipality: 'Talatona',
    province: 'Luanda',
    category: 'Empresas de distribuição de água',
    connectivity: 'LoRaWAN',
    controller: 'Unidade AQUASENSE v1',
    lastSyncIso: 'Hoje, 14:33:05',
    totalVolumeM3: 18420.6,
    dailyLiters: 31200,
    habitualDailyLiters: 30500,
    currentFlowLpm: 21.8,
    pressureBar: 3.12,
    valveClosed: false,
    wastedLitersEstimate: 0,
    continuousFlowMinutes: 40,
    continuousFlowSeconds: 2425,
    quality: {
      ph: 7.3,
      turbidityNtu: 0.8,
      tdsPpm: 204,
      temperatureC: 22.9,
    },
    series24h: build24hSeries(2850, 1.02),
    series7d: build7dSeries(30500, [0.99, 1.01, 1.0, 1.03, 1.02, 1.05, 1.02]),
    series30d: build30dSeries(30500, 1.01),
    activeScenario: 'normal',
  },
];

export const PROBLEMS_LIST = [
  {
    num: '01',
    title: 'Leitura manual dos contadores domiciliares',
    description:
      'Depende da deslocação de agentes e do registo manual, o que pode originar atrasos, erros de leitura e menor regularidade da informação.',
  },
  {
    num: '02',
    title: 'Dificuldade no acompanhamento do consumo',
    description:
      'Sem registos frequentes e acessíveis, o consumidor tem dificuldade em conhecer o seu padrão de consumo e a respectiva evolução no tempo.',
  },
  {
    num: '03',
    title: 'Identificação tardia de fugas',
    description:
      'Fugas internas ou perdas silenciosas podem passar despercebidas durante longos períodos, sendo apenas detectadas quando os seus efeitos se tornam evidentes.',
  },
  {
    num: '04',
    title: 'Desperdício de água',
    description:
      'A ausência de informação imediata dificulta a adopção de hábitos de consumo consciente e a correcção de comportamentos que originam desperdício.',
  },
  {
    num: '05',
    title: 'Monitorização da qualidade da água pouco acessível',
    description:
      'Os consumidores dispõem de poucos meios simples para acompanhar alterações nas características da água que recebem.',
  },
];

export const SOLUTION_ELEMENTS = [
  {
    num: '01',
    title: 'Dispositivo electrónico inteligente',
    description:
      'Unidade instalada junto ao contador de água, responsável por recolher, processar e enviar os dados.',
    status: 'Em desenvolvimento' as const,
  },
  {
    num: '02',
    title: 'Leitura automatizada do consumo',
    description:
      'Registo automático do volume consumido, dispensando a leitura manual e permitindo o acompanhamento contínuo.',
    status: 'Em desenvolvimento' as const,
  },
  {
    num: '03',
    title: 'Sensores físico-químicos',
    description:
      'Monitorização de parâmetros como pH, turbidez, TDS/condutividade e temperatura, enquanto indicadores de alterações na água.',
    status: 'Em desenvolvimento' as const,
  },
  {
    num: '04',
    title: 'Comunicação e transmissão de dados',
    description:
      'Envio dos dados para a plataforma através de tecnologias adequadas ao local de instalação (Wi-Fi, GSM/4G ou outras).',
    status: 'Previsto' as const,
  },
  {
    num: '05',
    title: 'Plataforma digital de gestão',
    description:
      'Ambiente digital para visualização, histórico, gestão centralizada e partilha de informação com consumidores e entidades gestoras.',
    status: 'Em desenvolvimento' as const,
  },
  {
    num: '06',
    title: 'Alertas e recomendações',
    description:
      'Notificações perante consumos anormais, possíveis fugas ou alterações nos parâmetros, acompanhadas de recomendações.',
    status: 'Previsto' as const,
  },
];

export const ARCHITECTURE_STEPS = [
  {
    step: 1,
    title: 'Contador de água',
    short: 'Ponto de medição do consumo',
    detail:
      'Contador domiciliar ou sectorial existente onde o consumo de água é medido no ponto de entrada da instalação.',
    dark: false,
  },
  {
    step: 2,
    title: 'Dispositivo inteligente',
    short: 'Unidade electrónica junto ao contador',
    detail:
      'Módulo electrónico compacto instalado junto ao contador convencional para recolha automatizada sem alterar a rede hidráulica principal.',
    dark: true,
  },
  {
    step: 3,
    title: 'Sensores',
    short: 'Fluxo, pH, turbidez, TDS e temperatura',
    detail:
      'Conjunto de sensores de caudal e parâmetros físico-químicos que acompanham continuamente o volume e variações indicativas da água.',
    dark: false,
  },
  {
    step: 4,
    title: 'Processamento dos dados',
    short: 'Microcontrolador (ESP32 ou equivalente)',
    detail:
      'Leitura local dos sensores, filtragem de ruído, detecção inicial de eventos e preparação segura dos pacotes de telemetria.',
    dark: true,
  },
  {
    step: 5,
    title: 'Comunicação IoT',
    short: 'Wi-Fi / GSM / 4G ou outra tecnologia',
    detail:
      'Transmissão periódica ou em tempo real adaptada à cobertura disponível em cada residência, condomínio ou ponto comunitário.',
    dark: false,
  },
  {
    step: 6,
    title: 'Base de dados',
    short: 'Armazenamento de históricos',
    detail:
      'Registo estruturado das séries temporais de consumo, qualidade da água e histórico de eventos para auditoria e planeamento.',
    dark: false,
  },
  {
    step: 7,
    title: 'Plataforma digital',
    short: 'Dashboard, alertas e recomendações',
    detail:
      'Ambiente web para acompanhamento visual, identificação de anomalias, gestão centralizada e emissão de recomendações práticas.',
    dark: false,
  },
  {
    step: 8,
    title: 'Consumidor / Entidade gestora',
    short: 'Acesso à informação e à gestão',
    detail:
      'Informação clara e transparente para famílias, condomínios, escolas, instituições públicas e empresas de distribuição de água.',
    dark: false,
  },
];

export const HARDWARE_COMPONENTS = [
  {
    component: 'ESP32 ou microcontrolador equivalente',
    purpose: 'Processamento local, leitura dos sensores e conectividade',
    state: 'Previsto',
  },
  {
    component: 'Sensor de fluxo ou mecanismo de leitura do contador',
    purpose: 'Medição do volume de água consumido',
    state: 'Previsto',
  },
  {
    component: 'Sensor de pH',
    purpose: 'Acompanhamento da acidez/alcalinidade da água',
    state: 'Previsto',
  },
  {
    component: 'Sensor de turbidez',
    purpose: 'Acompanhamento da transparência (partículas em suspensão)',
    state: 'Previsto',
  },
  {
    component: 'Sensor de TDS / condutividade',
    purpose: 'Indicação do teor de sólidos dissolvidos',
    state: 'Previsto',
  },
  {
    component: 'Sensor de temperatura',
    purpose: 'Registo da temperatura da água',
    state: 'Previsto',
  },
  {
    component: 'Wi-Fi / GSM / 4G ou outras',
    purpose: 'Transmissão de dados, consoante o local e a cobertura',
    state: 'Previsto',
  },
];

export const CORE_FEATURES = [
  {
    num: '01',
    name: 'Leitura automatizada dos contadores',
    description: 'Registo automático do consumo, sem necessidade de leitura manual.',
    status: 'Em desenvolvimento',
  },
  {
    num: '02',
    name: 'Monitorização periódica ou em tempo real',
    description: 'Recolha de dados com a frequência adequada a cada aplicação.',
    status: 'Em desenvolvimento',
  },
  {
    num: '03',
    name: 'Histórico de consumo',
    description: 'Consulta da evolução do consumo ao longo do tempo.',
    status: 'Em desenvolvimento',
  },
  {
    num: '04',
    name: 'Identificação de consumos anormais',
    description: 'Comparação do consumo com padrões habituais para assinalar desvios.',
    status: 'Previsto',
  },
  {
    num: '05',
    name: 'Detecção de possíveis fugas',
    description: 'Sinalização de consumos contínuos ou fora do padrão que possam indiciar fugas.',
    status: 'Previsto',
  },
  {
    num: '06',
    name: 'Monitorização da qualidade da água',
    description: 'Acompanhamento de pH, turbidez, TDS/condutividade e temperatura.',
    status: 'Em desenvolvimento',
  },
  {
    num: '07',
    name: 'Alertas automáticos',
    description: 'Notificações ao utilizador perante eventos ou valores fora dos limites definidos.',
    status: 'Previsto',
  },
  {
    num: '08',
    name: 'Recomendações aos consumidores',
    description: 'Sugestões práticas para reduzir o desperdício e responder a alterações.',
    status: 'Previsto',
  },
  {
    num: '09',
    name: 'Dashboard de gestão centralizada',
    description: 'Painel único para consumidores e entidades gestoras.',
    status: 'Em desenvolvimento',
  },
];

export const IMPACT_BENEFITS = [
  {
    title: 'Redução do desperdício de água',
    description: 'Informação imediata que ajuda a corrigir comportamentos e perdas.',
  },
  {
    title: 'Promoção do consumo consciente',
    description: 'Maior visibilidade do consumo e recomendações práticas.',
  },
  {
    title: 'Identificação atempada de fugas',
    description: 'Sinalização precoce de consumos fora do padrão.',
  },
  {
    title: 'Maior transparência na gestão',
    description: 'Leituras registadas de forma automática e consultáveis.',
  },
  {
    title: 'Acesso à informação sobre a qualidade',
    description: 'Acompanhamento de parâmetros indicativos da água.',
  },
  {
    title: 'Gestão sustentável dos recursos hídricos',
    description: 'Dados que apoiam o planeamento e a decisão.',
  },
];

export const ODS_CONTRIBUTIONS = [
  {
    number: '6',
    title: 'Água potável e saneamento',
    description: 'Acompanhamento e gestão mais eficiente da água.',
    variant: 'navy' as const,
  },
  {
    number: '9',
    title: 'Indústria, inovação e infra-estruturas',
    description: 'Tecnologia aplicada às infra-estruturas hídricas.',
    variant: 'ocean' as const,
  },
  {
    number: '11',
    title: 'Cidades e comunidades sustentáveis',
    description: 'Comunidades com informação para gerir melhor a água.',
    variant: 'navy' as const,
  },
  {
    number: '12',
    title: 'Consumo e produção responsáveis',
    description: 'Consumo consciente e redução do desperdício.',
    variant: 'ocean' as const,
  },
];

export const BENEFICIARIES_TABLE = [
  {
    beneficiary: 'Residências e famílias',
    application: 'Acompanhamento do consumo e recepção de alertas no domicílio',
    benefit: 'Controlo do consumo e identificação de fugas',
  },
  {
    beneficiary: 'Condomínios',
    application: 'Monitorização por fracção ou por ponto de entrega',
    benefit: 'Transparência na leitura e detecção de anomalias',
  },
  {
    beneficiary: 'Empresas de distribuição de água',
    application: 'Leitura remota e visão agregada dos dados',
    benefit: 'Redução de leituras manuais e melhor visão operacional',
  },
  {
    beneficiary: 'Instituições públicas',
    application: 'Informação para planeamento e gestão de edifícios e serviços',
    benefit: 'Apoio à decisão e à gestão sustentável',
  },
  {
    beneficiary: 'Escolas e universidades',
    application: 'Monitorização nas instalações e projectos educativos',
    benefit: 'Sensibilização para o consumo consciente e formação em IoT',
  },
  {
    beneficiary: 'Comunidades e projectos de desenvolvimento sustentável',
    application: 'Monitorização em pontos comunitários de abastecimento',
    benefit: 'Acompanhamento de alterações da água e gestão colectiva',
  },
];

export const ROADMAP_STEPS = [
  {
    step: 1,
    title: 'Testes-piloto em residências',
    description: 'Validação técnica e funcional em ambiente real.',
  },
  {
    step: 2,
    title: 'Expansão para condomínios e comunidades',
    description: 'Alargamento a conjuntos de pontos de consumo.',
  },
  {
    step: 3,
    title: 'Integração com empresas de distribuição',
    description: 'Articulação com entidades gestoras e respectivos sistemas.',
  },
  {
    step: 4,
    title: 'Desenvolvimento de aplicações móveis',
    description: 'Acesso à informação e aos alertas no telemóvel.',
  },
  {
    step: 5,
    title: 'Análise inteligente dos padrões de consumo',
    description: 'Detecção avançada de anomalias e previsão de consumo.',
  },
  {
    step: 6,
    title: 'Expansão a outras regiões de Angola e mercados africanos',
    description: 'Adaptação da solução a novos contextos.',
  },
];

export const ANGOLA_PROVINCES = [
  'Luanda',
  'Huíla',
  'Benguela',
  'Huambo',
  'Cabinda',
  'Cuanza Sul',
  'Cuanza Norte',
  'Malanje',
  'Namibe',
  'Uíge',
  'Bié',
  'Zaire',
  'Lunda Norte',
  'Lunda Sul',
  'Moxico',
  'Cunene',
  'Cuando Cubango',
  'Bengo',
];

export const PROVINCE_MUNICIPALITIES: Record<string, string[]> = {
  Huíla: [
    'Lubango',
    'Humpata',
    'Chibia',
    'Matala',
    'Quipungo',
    'Caluquembe',
    'Caconda',
    'Cacula',
    'Chicomba',
    'Chipindo',
    'Cuvango',
    'Gambos',
    'Jamba',
    'Quilengues',
  ],
  Luanda: [
    'Talatona',
    'Luanda',
    'Belas',
    'Viana',
    'Kilamba Kiaxi',
    'Cazenga',
    'Cacuaco',
    'Icolo e Bengo',
    'Quiçama',
  ],
  Benguela: ['Benguela', 'Lobito', 'Catumbela', 'Baía Farta', 'Cubal', 'Ganda'],
  Huambo: ['Huambo', 'Caála', 'Bailundo', 'Ecunha', 'Londuimbali', 'Longonjo'],
  Cabinda: ['Cabinda', 'Cacongo', 'Buco-Zau', 'Belize'],
  'Cuanza Sul': ['Sumbe', 'Porto Amboim', 'Gabela', 'Cela', 'Quibala'],
  'Cuanza Norte': ['Cazengo', 'Cambambe', 'Golungo Alto', 'Ambaca'],
  Malanje: ['Malanje', 'Cacuso', 'Calandula', 'Cangandala'],
  Namibe: ['Moçâmedes', 'Tômbwa', 'Bibala', 'Camucuio', 'Virei'],
  Uíge: ['Uíge', 'Negage', 'Sanza Pombo', 'Maquela do Zombo'],
  Bié: ['Cuito', 'Andulo', 'Camacupa', 'Catabola', 'Chinguar'],
  Zaire: ['Mbanza Congo', 'Soyo', 'Nzeto', 'Cuimba'],
  'Lunda Norte': ['Chitato', 'Dundo', 'Lucapa', 'Cuango'],
  'Lunda Sul': ['Saurimo', 'Cacolo', 'Dala', 'Muconda'],
  Moxico: ['Luena', 'Camenongue', 'Léua', 'Luau'],
  Cunene: ['Cuanhama', 'Ombadja', 'Cahama', 'Namacunde'],
  'Cuando Cubango': ['Menongue', 'Cuito Cuanavale', 'Calai', 'Dirico'],
  Bengo: ['Dande', 'Ambriz', 'Bula Atumba', 'Nambuangongo'],
};

export const HUILA_DEMO_BAIRROS = [
  'Bairro Comercial',
  'Tchioco',
  'Nossa Senhora do Monte',
  'Mapunda',
  'João de Almeida',
  'Mitcha',
  'Laureanos',
  'Lucrécia',
];
