import type {
  ActionPlan,
  AIRecommendation,
  EquipmentRecommendation,
  Incident,
  TrainingPlan,
} from "../types/capa";

/**
 * Helper function to group array items by a key
 * @param array - Array of items to group
 * @param key - Key to group by
 * @returns Object with grouped items
 */
const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Generate training recommendations based on incident patterns
 * @param incidents - List of incidents to analyze
 * @param existingPlans - Existing action plans to avoid duplication
 * @returns Array of training recommendations
 */
const generateTrainingRecommendations = (
  incidents: Incident[],
  existingPlans: ActionPlan[]
): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];

  // Group incidents by category
  const incidentsByCategory = groupBy(incidents, "category");

  // Rule: Multiple incidents in same category → Training recommendation
  Object.entries(incidentsByCategory).forEach(
    ([category, categoryIncidents]) => {
      if (categoryIncidents.length >= 2) {
        const trainingPlan: TrainingPlan = {
          id: `training_${Date.now()}_${Math.random()}`,
          courseId: `course_${category}`,
          courseName: `Formation ${category}`,
          assignedEmployees: [],
          dueDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          priority: "Obligatoire",
          source: "ai_recommendation",
          completionStatus: {
            total: 0,
            completed: 0,
            inProgress: 0,
            notStarted: 0,
          },
        };

        recommendations.push({
          id: `rec_${Date.now()}_${Math.random()}`,
          type: "training",
          confidence: Math.min(85 + categoryIncidents.length * 5, 95),
          reasoning: `${categoryIncidents.length} incidents de type "${category}" détectés ce mois`,
          suggestedItem: trainingPlan,
          basedOn: {
            incidents: categoryIncidents.map((i) => i.id),
            riskAssessments: [],
            historicalData: true,
          },
          status: "pending",
          createdDate: new Date(),
        });
      }
    }
  );

  return recommendations;
};

/**
 * Generate equipment recommendations based on incidents
 * @param incidents - List of incidents to analyze
 * @returns Array of equipment recommendations
 */
const generateEquipmentRecommendations = (
  incidents: Incident[]
): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];

  // Rule: Severe incidents → Equipment recommendations
  const severeIncidents = incidents.filter(
    (i) => i.severity === "severe" || i.severity === "critical"
  );

  severeIncidents.forEach((incident) => {
    const equipment: EquipmentRecommendation = {
      id: `equip_${Date.now()}_${Math.random()}`,
      name: `EPI recommandé pour ${incident.category}`,
      category: "EPI",
      description: `Équipement de protection recommandé suite à incident ${incident.id}`,
      certifications: ["EN 166", "EN 374"],
      features: ["Protection maximale", "Confortable", "Certifié"],
      aiReason: `Incident ${
        incident.severity
      } détecté: ${incident.description.substring(0, 50)}...`,
      linkedIncidentId: incident.id,
      priority: "Urgent",
      status: "pending",
      image: "/api/placeholder/200/200",
    };

    recommendations.push({
      id: `rec_${Date.now()}_${Math.random()}`,
      type: "equipment",
      confidence: 90,
      reasoning: `Incident ${incident.severity} nécessite équipement de protection`,
      suggestedItem: equipment,
      basedOn: {
        incidents: [incident.id],
        riskAssessments: [],
        historicalData: false,
      },
      status: "pending",
      createdDate: new Date(),
    });
  });

  return recommendations;
};

/**
 * Main AI recommendation engine
 * Analyzes incidents and context to generate recommendations for training and equipment
 * @param context - Context object containing incidents, action plans, and completed trainings
 * @returns Array of AI-generated recommendations
 */
export const generateRecommendations = (context: {
  incidents: Incident[];
  actionPlans: ActionPlan[];
  completedTrainings: string[];
}): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];

  // Generate training recommendations
  const trainingRecs = generateTrainingRecommendations(
    context.incidents,
    context.actionPlans
  );
  recommendations.push(...trainingRecs);

  // Generate equipment recommendations
  const equipmentRecs = generateEquipmentRecommendations(context.incidents);
  recommendations.push(...equipmentRecs);

  return recommendations;
};

/**
 * Get recommendations for a specific action plan
 * @param actionId - ID of the action plan
 * @param allRecommendations - All available recommendations
 * @returns Array of recommendations linked to the action plan
 */
export const getRecommendationsForAction = (
  actionId: string,
  allRecommendations: AIRecommendation[]
): AIRecommendation[] => {
  return allRecommendations.filter((rec) => {
    if (rec.type === "training") {
      const training = rec.suggestedItem as TrainingPlan;
      return training.linkedActionPlanId === actionId;
    }
    if (rec.type === "equipment") {
      const equipment = rec.suggestedItem as EquipmentRecommendation;
      return equipment.linkedActionPlanId === actionId;
    }
    return false;
  });
};
