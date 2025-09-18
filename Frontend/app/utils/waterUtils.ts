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
export function calculatePerMissionTarget(weightKg: number, missionsCount: number = 3): number {
  // Divide a meta diária de água pelo número de missões
  // Exemplo: 2450 mL / 3 = ~817 mL por missão
  return calculateDailyWaterTarget(weightKg) / missionsCount;
}
