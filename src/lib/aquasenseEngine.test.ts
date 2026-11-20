import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ADMIN_SECURITY,
  applyHydraulicAction,
  applyScenarioToPoint,
  authenticateAdmin,
  computeNetworkSummary,
  detectConsumptionAnomaly,
  estimateCostKz,
  evaluateWaterQuality,
  filterMeterPoints,
  formatDurationHms,
  formatPointsCsv,
  generateAlertsAndRecommendations,
  stepMeterSimulation,
  validateConsumerLogin,
  validateNewMeterInput,
  validateOrganizationLogin,
  validatePilotInquiry,
} from './aquasenseEngine';
import { INITIAL_METER_POINTS } from './aquasenseData';

test('evaluateWaterQuality returns normal for balanced readings', () => {
  const result = evaluateWaterQuality({
    ph: 7.2,
    turbidityNtu: 0.9,
    tdsPpm: 220,
    temperatureC: 23.5,
  });
  assert.equal(result.overallStatus, 'normal');
  assert.equal(result.parameters.length, 4);
  assert.ok(result.parameters.every((p) => p.status === 'normal'));
});

test('evaluateWaterQuality flags out-of-range pH and turbidity as alerta', () => {
  const result = evaluateWaterQuality({
    ph: 5.7,
    turbidityNtu: 7.2,
    tdsPpm: 250,
    temperatureC: 24.0,
  });
  assert.equal(result.overallStatus, 'alerta');
  assert.equal(result.parameters.find((p) => p.key === 'ph')?.status, 'alerta');
  assert.equal(result.parameters.find((p) => p.key === 'turbidityNtu')?.status, 'alerta');
});

test('detectConsumptionAnomaly detects continuous leak and abnormal spikes', () => {
  const normal = detectConsumptionAnomaly(1.2, 430, 550, 460, 15, 1.5);
  assert.equal(normal.leakDetected, false);
  assert.equal(normal.status, 'normal');

  const leak = detectConsumptionAnomaly(2.8, 680, 550, 460, 180, 1.5);
  assert.equal(leak.leakDetected, true);
  assert.equal(leak.status, 'alerta');
});

test('applyScenarioToPoint, stepMeterSimulation, and applyHydraulicAction behave realistically', () => {
  const basePoint = INITIAL_METER_POINTS[0];
  const leakPoint = applyScenarioToPoint(basePoint, 'fuga');
  assert.ok(leakPoint.pressureBar < basePoint.pressureBar);
  assert.ok(leakPoint.wastedLitersEstimate > 0);

  const stepped = stepMeterSimulation(leakPoint, 3, 1);
  assert.ok(stepped.dailyLiters > leakPoint.dailyLiters);
  assert.ok(stepped.wastedLitersEstimate > leakPoint.wastedLitersEstimate);
  assert.equal(stepped.continuousFlowSeconds, leakPoint.continuousFlowSeconds + 1);
  assert.equal(formatDurationHms(3665), '01:01:05');

  const closedValve = applyHydraulicAction(stepped, 'toggle_valvula');
  assert.equal(closedValve.valveClosed, true);
  assert.equal(closedValve.currentFlowLpm, 0);
  assert.equal(closedValve.continuousFlowSeconds, 0);

  const steppedClosed = stepMeterSimulation(closedValve, 4, 1);
  assert.equal(steppedClosed.currentFlowLpm, 0);

  const reopened = applyHydraulicAction(closedValve, 'toggle_valvula');
  const withTap = applyHydraulicAction(reopened, 'torneira');
  assert.ok(withTap.currentFlowLpm > reopened.currentFlowLpm);
  assert.equal(estimateCostKz(1000), 420);
});

test('generateAlertsAndRecommendations generates leak alert and honors resolved IDs', () => {
  const leakPoint = applyScenarioToPoint(INITIAL_METER_POINTS[0], 'fuga');
  const config = { dailyLimitLiters: 550, leakContinuousThresholdLpm: 1.5 };

  const firstPass = generateAlertsAndRecommendations(leakPoint, config);
  const fugaAlert = firstPass.alerts.find((a) => a.type === 'fuga');
  assert.ok(fugaAlert);
  assert.equal(fugaAlert.resolved, false);

  const secondPass = generateAlertsAndRecommendations(
    leakPoint,
    config,
    new Set([fugaAlert.id])
  );
  assert.equal(secondPass.alerts.find((a) => a.id === fugaAlert.id)?.resolved, true);
});

test('validateConsumerLogin and validateOrganizationLogin enforce required fields including municipality', () => {
  const badConsumer = validateConsumerLogin({
    name: '',
    bairro: '',
    municipality: '',
    province: 'Huíla',
    meterCode: '12',
  });
  assert.equal(badConsumer.valid, false);
  assert.ok(badConsumer.errors.name);
  assert.ok(badConsumer.errors.bairro);
  assert.ok(badConsumer.errors.municipality);
  assert.ok(badConsumer.errors.meterCode);

  const goodConsumer = validateConsumerLogin({
    name: 'Mariana Tchivinda',
    bairro: 'Bairro Comercial',
    municipality: 'Lubango',
    province: 'Huíla',
    meterCode: 'AQ-HLA-021',
  });
  assert.equal(goodConsumer.valid, true);

  const badOrg = validateOrganizationLogin({
    organizationName: '',
    organizationType: 'Condomínios',
    contactName: 'A',
    bairro: '',
    municipality: '',
    province: 'Huíla',
    meterCode: '',
  });
  assert.equal(badOrg.valid, false);
  assert.ok(badOrg.errors.organizationName);
  assert.ok(badOrg.errors.contactName);
  assert.ok(badOrg.errors.municipality);

  const goodOrg = validateOrganizationLogin({
    organizationName: 'Condomínio Nossa Senhora do Monte',
    organizationType: 'Condomínios',
    contactName: 'Eng. Mateus Chivinda',
    bairro: 'Nossa Senhora do Monte',
    municipality: 'Lubango',
    province: 'Huíla',
    meterCode: 'AQ-HLA-112',
  });
  assert.equal(goodOrg.valid, true);
});

test('authenticateAdmin verifies default credentials, operator keys, and updated keys', () => {
  const okPrimary = authenticateAdmin(
    {
      username: DEFAULT_ADMIN_SECURITY.username,
      password: DEFAULT_ADMIN_SECURITY.password,
      accessKey: DEFAULT_ADMIN_SECURITY.primaryAccessKey,
    },
    DEFAULT_ADMIN_SECURITY
  );
  assert.equal(okPrimary.authenticated, true);

  const okOperator = authenticateAdmin(
    {
      username: DEFAULT_ADMIN_SECURITY.username,
      password: DEFAULT_ADMIN_SECURITY.password,
      accessKey: 'AQ-OP-LDA-8841',
    },
    DEFAULT_ADMIN_SECURITY
  );
  assert.equal(okOperator.authenticated, true);

  const badKey = authenticateAdmin(
    {
      username: DEFAULT_ADMIN_SECURITY.username,
      password: DEFAULT_ADMIN_SECURITY.password,
      accessKey: 'CHAVE-ERRADA',
    },
    DEFAULT_ADMIN_SECURITY
  );
  assert.equal(badKey.authenticated, false);

  const updatedConfig = {
    ...DEFAULT_ADMIN_SECURITY,
    primaryAccessKey: 'AQ-KEY-NOVA-2026',
    operatorKeys: DEFAULT_ADMIN_SECURITY.operatorKeys.map((k) => ({ ...k, active: false })),
  };
  assert.equal(
    authenticateAdmin(
      {
        username: updatedConfig.username,
        password: updatedConfig.password,
        accessKey: DEFAULT_ADMIN_SECURITY.primaryAccessKey,
      },
      updatedConfig
    ).authenticated,
    false
  );
  assert.equal(
    authenticateAdmin(
      {
        username: updatedConfig.username,
        password: updatedConfig.password,
        accessKey: 'AQ-KEY-NOVA-2026',
      },
      updatedConfig
    ).authenticated,
    true
  );
  assert.equal(
    authenticateAdmin(
      {
        username: updatedConfig.username,
        password: updatedConfig.password,
        accessKey: 'AQ-OP-LDA-8841',
      },
      updatedConfig
    ).authenticated,
    false
  );
});

test('computeNetworkSummary, filterMeterPoints, formatPointsCsv, and form validators work cleanly', () => {
  const summary = computeNetworkSummary(INITIAL_METER_POINTS);
  assert.equal(summary.totalPoints, 9);
  assert.equal(summary.pointsAlert, 3);

  const searchLubango = filterMeterPoints(INITIAL_METER_POINTS, 'lubango', 'todos', 'todas');
  assert.equal(searchLubango.length, 3);

  const searchTchioco = filterMeterPoints(INITIAL_METER_POINTS, 'tchioco', 'todos', 'todas');
  assert.equal(searchTchioco.length, 1);

  const csv = formatPointsCsv(INITIAL_METER_POINTS.slice(0, 2));
  assert.equal(csv.split('\n').length, 3);
  assert.ok(csv.includes('Pressao (bar)'));

  assert.equal(
    validateNewMeterInput({
      code: 'AQ-LDA-550',
      name: 'Residência Morro Bento',
      location: 'Belas, Luanda',
      category: 'Residências e famílias',
      connectivity: 'GSM/4G',
      habitualDailyLiters: '520',
    }).valid,
    true
  );

  assert.equal(
    validatePilotInquiry({
      name: 'João Manuel Costa',
      organization: 'Condomínio Acácias',
      email: 'joao.costa@acacias.ao',
      phone: '+244 923 456 789',
      profile: 'Condomínios',
      province: 'Luanda',
      message: 'Interesse no programa de testes-piloto para 48 fracções.',
    }).valid,
    true
  );
});
