/*
 * Função que calcula quanta água você deve beber por dia.
 * A quantidade é baseada no seu peso.
 * @param weightKg - Seu peso em quilogramas (kg)
 * @returns Quantidade de água recomendada por dia em mililitros (mL)
 */
export function calculateDailyWaterTarget(weightKg: number): number {
  // Multiplica o peso por 35 para obter a quantidade de água em mL
  // Exemplo: 70 kg * 35 = 2450 mL por dia
  return weightKg * 35;
}


/*
 * Função que calcula quanta água você deve beber em cada missão do dia
 * (por exemplo, manhã, tarde e noite).
 * @param weightKg - Seu peso em kg
 * @param missionsCount - Número de missoes no dia (padrão = 3)
 * @returns Quantidade de água por missão em mL
 */
export function calculatePerMissionTarget(
  weightKg: number,
  missionsCount: number = 3
): number {
  // Divide a meta diária de água pelo número de missões
  // Exemplo: 2450 mL / 3 = ~817 mL por missão
  return calculateDailyWaterTarget(weightKg) / missionsCount;
}


/*
 * Função que calcula a quantidade extra de água recomendada
 * para uma missão de exercício, com base no tempo de atividade
 * física (em minutos) e na temperatura ambiente (°C).
 *
 * Regras (mL/min):
 * - ≤ 20°C      => 6.5 mL/min
 * - 21–26°C     => 10 mL/min
 * - 27–32°C     => 13.5 mL/min
 * - > 33°C      => 17.5 mL/min
 *
 * Se activityTime ou ambientTemp forem 0 ou negativos,
 * retorna 0 (sem missão extra).
 *
 * @param activityTime - Tempo de exercício em minutos
 * @param ambientTempC - Temperatura ambiente em °C
 * @returns Quantidade de água para a missão extra em mL
 */
export function calculateExtraExerciseMission(
  activityTime: number,
  ambientTempC: number
): number {
  if (activityTime <= 0 || ambientTempC <= 0) {
    return 0;
  }

  let mlPerMin = 0;

  if (ambientTempC <= 20) {
    mlPerMin = 6.5;
  } else if (ambientTempC <= 26) {
    mlPerMin = 10;
  } else if (ambientTempC <= 32) {
    mlPerMin = 13.5;
  } else {
    // > 33°C
    mlPerMin = 17.5;
  }

  return activityTime * mlPerMin;
}
