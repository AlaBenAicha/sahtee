Interface utilisateur & expérience (UX/UI) SAHTEE
Formulaire de première visite SAHTEE (Onboarding global)
Objectif
 Mettre en place un formulaire unique de “première visite” pour la plateforme SAHTEE, permettant de collecter toutes les informations de base nécessaires aux 3 modules de base (Conformity Room, CAPA Room, Healthmeter). Ce formulaire sert de point de départ et de référence initiale pour l’analyse IA et les tableaux de bord.
Emplacement et accès
Accessible à la première connexion d’un manager / administrateur.


Accessible ensuite depuis le menu d’administration pour mise à jour partielle.


Contenu principal
Section “Organisation & structure”
secteurs d’activités / locaux / Nombre total de travailleurs, répartition par site / département.


Coordonnées des principaux responsables : manager QHSE/SST, manager RH, Médecin du travail, chef de département ou d’atelier …etc.


Description des sites / unités / ateliers.


Section “Conformité & réglementation” (alimente principalement Conformity Room)
Existence d’un système de management SST (ISO 45001 ou équivalent).


Existence d’un document d’évaluation des risques / DUER.


Présence de procédures SST, plans d’urgence, plans de prévention.


Historique synthétique des audits internes / externes, certifications obtenues.


Section “Incidents & actions” (alimente principalement CAPA Room)
Existence d’un système formalisé de gestion des incidents et CAPA.


Historique global (très synthétique) des incidents graves et récurrents.


Présence d’un plan d’actions SST existant.


Section “Santé & expositions” (alimente principalement Healthmeter)
Principaux risques santé identifiés (TMS, RPS, chimique, bruit, etc.).


Modalités de suivi de la santé au travail (visites médicales, suivi renforcé).


Expositions professionnelles déjà surveillées (bruit, poussières, solvants, etc.).


Section “Objectifs & stratégie SST”
Le manager peut saisir les objectifs de conformité et de performance SST.


Option “Laisser l’IA proposer des objectifs recommandés” en fonction des réponses et du secteur.


Documents importés
espace de dépôt détaillé pour importer les documents de base (rapports d’audit, DUER, politique SST, plans de formation, etc.) qui serviront de référence à l’IA et aux modules pour être en continuité.


Gestion des versions
La version initiale (“photographie de départ”) est conservée comme référence.


Le manager peut actualiser certaines réponses au fil du temps.


Historique des modifications accessible (date, utilisateur, champs modifiés).
360° Board : donne une vision synthétique des trois modules de base en donnant la cartographie des risques et les indicateurs clés de suivi et évaluation
Section I – Cartographie des risques
Affichage des 6 catégories de risques : physiques, chimiques, biologiques, psychosociaux, organisationnels, machines et équipements.


Possibilité de choisir le type de diagramme (barres, bulles, radar, etc.) et la vue (par unité de temps, par département, par site).


La cartographie est cohérente avec les données d’incidents et d’expositions remontées par les modules SAHTEE.


(le modèle IA ne donne pas un “vrai” calcul réglementaire mais une estimation pondérée. Concrètement, pour chaque donnée disponible (incident, quasi-accident, non-conformité, mesure d’exposition, extrait de document importé), l’IA classe l’événement dans une ou plusieurs catégories de risques (physiques, chimiques, biologiques, psychosocciaux, organisationnels, machines) avec un score entre 0 et 1. Ce score est ensuite pondéré par l’importance de l’événement (gravité, type : accident grave > quasi-accident > simple mention dans un rapport). On additionne tous les scores par catégorie sur la période, puis on transforme ces scores en pourcentage : % risque catégorie X = score_X / somme(scores toutes catégories) × 100. Le dashboard affiche alors la répartition des risques estimée par l’IA par catégorie, filtrable par période / site / département.)
Section II – Zone Indicateurs
on affiche une grande zone “Indicateurs” structurée ainsi :
Bandeau KPI global (4 tuiles)
Taux de conformité réglementaire SST


Taux de fréquence des accidents du travail (TF)


Taux de jours perdus liés aux AT/MP


% d’actions correctives / préventives (CAPA) clôturées dans les délais


Juste en dessous : onglets d’indicateurs
Onglet 1 : Proactifs (Lead)
Taux de réalisation des formations SST obligatoires


Taux de réalisation des audits / inspections SST planifiés


Taux de signalement des situations dangereuses / quasi-accidents


Onglet 2 : Réactifs (Lag)
Nombre d’accidents du travail avec arrêt (sur la période)


Nombre de maladies professionnelles reconnues


% de mesures d’exposition dépassant les valeurs limites (bruit, solvants, poussières, etc.)


Onglet 3 : Synthèse & tendances – vue comparant l’évolution des indicateurs lead/lag par période, site, département.
Tous les indicateurs de cette zone sont filtrables par : période, site/département et type de risque (physique, chimique, biologique, psychosocial, organisationnel, machines).
( voir Tableau des indicateurs ci-dessous)
ID
Nom de l’indicateur
Zone du 360° Board
Module source
Méthode de calcul (pseudo-code)
1
Taux de conformité réglementaire SST
Bandeau KPI global
Conformity Room
taux_conformite = (nb_exigences_conformes / nb_exigences_totales) * 100
2
Taux de fréquence des accidents du travail (TF)
Bandeau KPI global
CAPA Room (+ données RH)
TF = (nb_AT_avec_arret * 1_000_000) / nb_heures_travaillees
3
Taux de jours perdus liés aux AT/MP
Bandeau KPI global
Healthmeter (+ RH)
taux_jours_perdus = (nb_jours_arret_AT_MP / nb_jours_travailles) * 100
4
% d’actions CAPA clôturées dans les délais
Bandeau KPI global
CAPA Room
taux_CAPA_delai = (nb_CAPA_cloturees_dans_les_delais / nb_CAPA_cloturees_total) * 100
5
Taux de réalisation des formations SST obligatoires
Onglet Proactifs (Lead)
CAPA Room – Formations
taux_formations = (nb_formations_obligatoires_realisees / nb_formations_obligatoires_planifiees) * 100
6
Taux de réalisation des audits / inspections SST planifiés
Onglet Proactifs (Lead)
Conformity Room – Audits/inspections
taux_audits = (nb_audits_realises / nb_audits_planifies) * 100
7
Taux de signalement des situations dangereuses / quasi-accidents
Onglet Proactifs (Lead)
CAPA Room – Incidents / Observations
taux_signalement = (nb_situations_dangereuses_signalees / effectif_moyen) * 100 (ou par 100 salariés selon ton choix)
8
Nombre d’accidents du travail avec arrêt
Onglet Réactifs (Lag)
CAPA Room – Incidents
nb_AT_avec_arret = COUNT(incidents WHERE type = 'AT' AND avec_arret = true AND date ∈ periode)
9
Nombre de maladies professionnelles reconnues
Onglet Réactifs (Lag)
Healthmeter
nb_maladies_pro = COUNT(dossiers_sante WHERE type = 'Maladie professionnelle' AND date_reconnaissance ∈ periode)
10
% de mesures d’exposition dépassant les valeurs limites
Onglet Réactifs (Lag)
Healthmeter – Expositions
taux_depassement_expo = (nb_mesures_exposition > valeur_limite / nb_mesures_exposition_total) * 100

Section III – Alertes et Activités
aperçu des infos d’alerte / d’urgence et des activités récentes issus de chaque module.
les outils AI intégrés dans la plateforme : 
Même IA à plusieurs “faces” = Une interface de chat transversale accessible partout + Une “version spécialisée” par module :
1. SafetyBot – Assistant transversal (accessible partout)
Forme d’intégration :
Icône / barre latérale fixe, visible sur tous les écrans.


Ouverture d’un panneau de chat à droite (type “copilot”) avec :


Zone de dialogue,


Boutons de questions suggérées (“Générer un rapport trimestriel”, “Montrer les CAPA en retard”, “Expliquer ce graphique”, etc.).


Fonctions transversales :
Répondre aux questions sur la plateforme : “Comment créer un audit ?”, “Comment filtrer par site ?”.


Accéder aux données multi-modules : “Donne-moi la synthèse SST du site X”, “Liste les risques chimiques les plus critiques”.


Générer des rapports : rapports PDF ou exports (mensuel, trimestriel, par site, etc.).


2. Conformity-AI (Conformity Room)
Forme :
Onglet ou panneau “Conformity-AI” à l’intérieur du module.


Bouton “Analyser ma conformité” / “Proposer un plan d’action”.


Rôle :
Analyse des écarts de conformité :


“Tu es à 82 % de conformité, les plus gros écarts sont sur : machines, atmosphères explosives, formation obligatoire.”


Détection de failles :


“Aucun audit réalisé sur les risques chimiques depuis 18 mois.”


Recommandations et CAPA proposées :


“Créer un audit ‘Machines’ sur site B dans le mois.”


Aide documentaire :


Résumer une norme ou un rapport d’audit importé, donner les obligations clés.


3. CAPA-AI (CAPA Room)
Forme :
Panneau “CAPA-AI” dans CAPA Room.


Boutons de type : “Analyser les incidents”, “Proposer des CAPA”.


Rôle :
Analyse des incidents et non-conformités :


Identifier tendances : “70 % des incidents récents sont liés à la manutention manuelle.”


Aide à la recherche de causes :


Suggestions de causes racines typiques (méthodes, matériel, formation, organisation…) à partir de la description de l’incident.


Proposition de CAPA :


Formuler des actions concrètes (formation ciblée, changement de procédure, amélioration d’équipement, etc.).


Priorisation :


Indiquer les actions les plus urgentes / impactantes selon gravité + fréquence.


4. Health-AI (Healthmeter)
Forme :
Panneau “Health-AI” dans Healthmeter.


Bouton “Analyser la situation santé” / “Détecter les groupes à risque”.


Rôle :
Analyse des tendances santé :


“Augmentation des TMS dans l’atelier A sur les 6 derniers mois.”


“Stress et RPS plus élevés dans le département Support.”


Analyse des expositions :


“Les niveaux de bruit dépassent régulièrement les limites dans la zone B.”


Prédiction / alerte précoce (approximative) :


“Si la tendance continue, risque d’augmentation des arrêts TMS dans ce service.”


Recommandations :


“Recommander un programme d’ergonomie + formation gestes/postures.”


“Mettre en place un suivi RPS ciblé sur les équipes X et Y.”
Module Healthmeter
1. Statut Santé
Offrir une fenêtre de synthèse, centrée sur les indicateurs et graphiques décrivant l’état actuel de la santé au travail et les tendances / prédictions par type de problème de santé.
icône : bouton importation des docs référentiels comme des tableaux Excel anciens comportant les données de santé des travailleurs.
Tuiles de synthèse (exemples) :
nombre de cas actifs (dossiers santé en suivi),


nombre d’employés sous surveillance médicale (suivi renforcé, post-exposition, etc.),


taux d’absentéisme santé sur la période,


nombre d’alertes d’exposition ou de santé en cours (TMS, RPS, expositions, etc.).


Graphiques d’état actuel :
répartition des cas par type de pathologie / catégorie (TMS, RPS, respiratoire, cardio, etc.),


évolution des TMS, RPS ou autres groupes de pathologies sur les derniers mois,


évolution de la durée moyenne d’arrêt liée à des causes SST.


Graphiques de tendances et prédictions (via Health-AI) :
projection approximative de l’évolution de certains indicateurs (ex. TMS, RPS, absentéisme santé) par service / atelier,


mise en évidence des groupes à risque (services, postes, sites) à surveiller en priorité.


Remarque : Healthmeter n’assure pas la planification des CAPA ; il signale les failles et groupes à risque, les actions sont ensuite créées et suivies dans CAPA Room.
2. Médecine de travail (fiches médicales & planification des visites)
Permettre au médecin du travail de suivre les dossiers de santé des salariés et de planifier les visites médicales, avec un fonctionnement proche du planning d’audits de Conformity Room.
Liste des salariés :
recherche par nom, matricule, poste, site,


filtres (service, type de suivi, statut actif / archivé).


Fiches médicales individuelles :
accessibles uniquement au médecin du travail (et à son équipe selon droits),


pour chaque salarié :


identité, poste / unité,


conditions médicales pertinentes pour le travail,


restrictions de poste et aménagements recommandés,


historique des expositions professionnelles pertinentes,


historique des visites médicales.


Templates de visites médicales :
chaque type de visite (embauche, périodique, reprise, pré-reprise, post-exposition, visite à la demande…) est guidé par un modèle de formulaire préprogrammé,


les données sont structurées par type de visite (sections et champs adaptés au motif de la visite).


Planification des visites (système similaire aux audits dans Conformity Room) :
calendrier des visites à venir,


type de visite, salarié concerné, site / service,


statut (à programmer / planifiée / réalisée / en retard),


rappels automatiques pour les visites périodiques ou obligatoires,


possibilité de créer une visite directement depuis la fiche salarié en choisissant le template de visite approprié.


3. Expositions
Suivre et analyser les expositions professionnelles des salariés aux facteurs de risque (agents chimiques, bruit, poussières, vibrations, etc.).
Vue par type de facteur de risque :
nom de la substance / facteur,


nombre de travailleurs exposés,


limite réglementaire (VLEP, seuils…),


niveau mesuré (valeur récente / moyenne),


date de la dernière mesure,


pourcentage de la limite atteint,


niveau d’alerte (Faible / Acceptable / Modéré / Critique).


Historique :
graphique d’évolution des niveaux d’exposition dans le temps,


possibilité de filtrer par site, atelier, poste, groupe de salariés.


Alertes :
génération d’alertes lorsque certains seuils d’exposition sont atteints ou dépassés,


mise en évidence des zones / groupes les plus exposés.


Les expositions et alertes identifiées servent de base à la réflexion et à la décision.
 La création et la planification des actions CAPA associées se font dans CAPA Room.
4. Health-AI (Assistant IA Santé & Expositions)
Analyser les données de santé et d’exposition pour détecter les tendances, alerter sur les faiblesses et orienter le manager et le médecin du travail sur les priorités.
Analyse des tendances santé :
détection d’augmentations significatives (ex. “Augmentation des TMS dans l’atelier A sur les 6 derniers mois”, “Stress et RPS plus élevés dans le département Support”),


comparaison entre services / sites.


Analyse des expositions :
identification des zones où les niveaux mesurés approchent ou dépassent les limites (ex. “Les niveaux de bruit dépassent régulièrement les limites dans la zone B”).


Prédictions / alertes précoces (approximatives) :
estimation du risque d’aggravation (ex. “Si la tendance continue, risque d’augmentation des arrêts TMS dans ce service”),


mise en évidence des groupes à suivre de près.


Recommandations de prévention :
propositions d’axes d’action (ex. “Recommander un programme d’ergonomie + formation gestes/postures”, “Mettre en place un suivi RPS ciblé sur les équipes X et Y”),


ces recommandations peuvent être transmises au module CAPA Room, où les actions correspondantes seront créées, planifiées et suivies. 
Module : Conformity Room
Module dédié à la gestion de la conformité réglementaire et normative SST à travers : recensement et suivi des exigences, visualisation du niveau de conformité, gestion des audits de conformité, interaction avec CAPA Room pour la mise en œuvre des actions correctives et préventives.
1/ Bibliothèque réglementaire
Centraliser et suivre l’ensemble des références réglementaires et normatives applicables en SST.
Liste structurée des références :
réglementations nationales SST (code du travail, décrets, arrêtés, etc.),


obligations sectorielles (par secteur d’activité),


normes internationales (ISO 45001, ISO 45003, ISO 45004, directives européennes, conventions OIT…).


Pour chaque référence :
titre, type (loi, décret, norme ISO, convention, guide sectoriel…),


pays / organisme de référence,


domaine (chimique, machines, incendie, RPS, etc.),


date de dernière mise à jour officielle,


statut d’intégration dans l’entreprise (non évaluée / en analyse / mise en œuvre / à réviser).


Filtres et recherche :
par type de référence (ISO, loi locale, convention, obligation sectorielle…),


par pays, domaine, secteur d’activité.


Bouton « Voir détails » donnant accès à une fiche détaillée (résumé, exigences clés, lien vers le texte officiel si disponible, et documents internes associés).
2/ Statut Conformité
Donner une vue synthétique de l’état de conformité par norme / obligation et son évolution globale.
Tuiles récapitulatives :
Nombre total de références applicables (réglementations nationales, obligations sectorielles, normes, etc.).


% de références évaluées (références pour lesquelles un état de conformité a été renseigné / total des références applicables).


% de références conformes (références évaluées avec statut “Conforme”).


Nombre d’écarts de conformité ouverts (écarts réglementaires identifiés, en lien avec les actions CAPA correspondantes dans CAPA Room).


Indicateurs globaux :
Répartition des références par statut (Conforme / En cours / Non conforme / À réviser), présentée sous forme de graphique de synthèse.


% de références avec preuves documentaires vérifiées (références pour lesquelles des preuves de conformité sont attachées et validées : rapports, procédures, enregistrements).


Nombre d’audits de conformité faits / en cours / programmés (par site, domaine ou norme).


Délai moyen de traitement des écarts de conformité (temps moyen entre la détection d’un écart réglementaire et sa clôture, calculé à partir des actions associées dans CAPA Room).


Tableau détaillé par référence :
norme / obligation,


domaine / type,


pourcentage de mise en conformité,


statut (Conforme / En cours / À réviser / Non traité),


lien vers les documents associés (audits, preuves, comptes rendus) et vers les actions CAPA correspondantes dans CAPA Room.


3/ Audits
Planifier, suivre et historiser les audits de conformité SST.
Tableau des audits récents et programmés :
titre de l’audit, norme / domaine concerné,


site / périmètre,


organisme (interne / externe, nom du certificateur si applicable),


date prévue / date réalisée,


statut (planifié / en cours / clôturé),


score ou niveau de conformité obtenu.


Actions possibles :
accéder au rapport détaillé de l’audit,


modifier les informations de l’audit,


lancer un nouvel audit à partir d’un bouton dédié.


Planification :
calendrier des audits faits et à venir (par site, par domaine, par norme),


rappels des validations / renouvellements réglementaires à effectuer (certifications à renouveler, audits périodiques obligatoires).


Template d’audit :
modèle de check-list ou grille d’audit pré-paramétrée par domaine / norme,


possibilité de personnaliser les items et les questions,


à la clôture de l’audit, les écarts et non-conformités identifiés peuvent être convertis en actions CAPA dans CAPA Room (la planification et le suivi détaillé de ces actions sont ensuite gérés exclusivement dans CAPA Room).


4/ Conformity-AI (Assistant IA de conformité)
Aider le manager à interpréter les données de conformité, détecter les faiblesses et proposer une planification des audits pour assurer le suivi et surveillance et des actions correctives et préventives pertinentes.
Analyse des écarts de conformité :
calcul et affichage d’un taux global de conformité,


mise en avant des domaines les plus en retard (ex. « machines », « atmosphères explosives », « formation obligatoire »),


visualisation synthétique des écarts par site / domaine / norme.


Détection de failles :
repérage des zones non couvertes (ex. « aucun audit réalisé sur les risques chimiques depuis 18 mois »),


alertes sur les exigences critiques non traitées ou en retard,


identification des références sans preuves de conformité associées.


Recommandations et propositions de CAPA :
suggestions d’actions concrètes (ex. « Créer un audit “Machines” sur site B dans le mois », « Mettre à jour la procédure formation EPI »),


possibilité de transformer directement une recommandation en action CAPA dans le module CAPA Room (l’IA pré-remplit le brouillon de CAPA, le manager valide),


les actions ainsi créées sont ensuite planifiées, suivies et clôturées dans CAPA Room.


Aide documentaire :
synthèse automatique des normes ou rapports d’audit importés,


extraction des obligations clés, des points d’attention et des écarts majeurs,


réponses aux questions du manager (ex. « Quelles sont les exigences principales de cette norme ? », « Quels écarts ressortent de ce rapport ? »), sous forme de texte explicatif ou de liste de points.
Module : CAPA Room
C’est le centre de pilotage de toutes les actions correctives et préventives (CAPA) liées à la SST.
Il est alimenté par :
Conformity Room : écarts réglementaires, non-conformités, résultats d’audits.


Healthmeter : expositions critiques, groupes à risque, tendances santé.


Formulaire de première visite SAHTEE : niveau de maturité initial, priorités déclarées.


Incidents / quasi-incidents déclarés : événements remontés en temps réel depuis le terrain.


Dès qu’un incident ou quasi-incident est déclaré, il apparaît automatiquement dans CAPA Room comme élément à traiter, dans une zone dédiée (ex. colonne « CAPA urgentes »), afin de passer à l’action sans délai.
1. Statut CAPA
Donner une vue synthétique de la performance du système d’actions SST, en cohérence avec la logique d’indicateurs de la norme ISO 45004 (suivi des actions, réactivité, prévention).
Tuiles de synthèse (4 indicateurs clés) :
Nombre total de CAPA actives (toutes actions “À planifier”, “À faire” ou “En cours”).


Nombre de CAPA urgentes ouvertes (issues d’incidents graves, expositions critiques, alertes IA).


% de CAPA en retard (actions dont la date d’échéance est dépassée / CAPA actives).


% de CAPA clôturées sur la période (proportion d’actions clôturées parmi celles prévues sur la période sélectionnée).


Indicateurs globaux (4 indicateurs complémentaires) :
Délai moyen de clôture des CAPA (temps moyen entre l’ouverture et la clôture d’une action).


Répartition des CAPA par type (correctives / préventives) et ratio préventif/correctif, pour suivre la montée en prévention.


Répartition des CAPA par origine (Conformity Room, Healthmeter, Incidents, IA / autres), pour visualiser d’où viennent les problèmes et les actions.


Répartition des CAPA par thème ou domaine de risque (ergonomie, chimique, RPS, machines, organisationnel, etc.) et/ou par service / site, pour identifier les zones les plus chargées en actions.


Ces indicateurs servent de base à l’analyse et à l’amélioration continue, dans l’esprit d’ISO 45004 (combinaison d’indicateurs proactifs et réactifs).
2-3. Plan CAPA + CAPA-AI (vue Kanban intelligente)
Organiser, prioriser et planifier toutes les actions SST dans une vue unique, assistée par l’IA.
Vue Kanban des CAPA :
colonnes proposées (adaptables) :
CAPA urgentes (incidents graves, expositions critiques, alertes prioritaires),


À planifier,


À faire,


En cours,


Terminées.


Chaque carte CAPA contient :
description de l’action (formation, modification de procédure, changement d’équipement, communication, aménagement, etc.),


type : préventive / corrective,


thème (ergonomie, accident, chimique, RPS, machines, etc.),


origine (audit, conformité, santé, incident, recommandation IA, autre),


priorité (basse / moyenne / haute / critique),


responsable / équipe en charge,


date d’échéance,


progression (%),


liens vers les éléments sources (incident, rapport d’audit, exposition, analyse IA).


Intégration des incidents :
lorsqu’un incident ou quasi-incident est déclaré, une CAPA (ou brouillon de CAPA) est automatiquement créée et placée dans la colonne « CAPA urgentes » ou « À planifier » selon la criticité ;


le responsable SST peut compléter ou ajuster la carte avant de la faire avancer dans le flux.


CAPA-AI intégrée dans la vue Kanban (assistant IA d’aide à la décision) :
Proposition, Priorisation et Planification CAPA :
proposition d’un planning optimisé des CAPA en fonction :


des priorités,


des ressources disponibles,


des délais / contraintes.


affichage d’une timeline hebdomadaire et/ou d’une matrice de priorité (impact vs urgence, charge vs capacité),


le manager peut ajuster et valider les propositions de planning.


génération d’actions concrètes (formation ciblée, mise à jour de procédure, changement d’EPI, réaménagement de poste, etc.),


pré-remplissage de cartes CAPA dans la bonne colonne (CAPA urgente, À planifier, etc.), que le manager peut valider ou modifier.


calcul d’une priorité “IA” en combinant gravité, fréquence, expositions, nombre de personnes impactées,


mise en avant des actions les plus urgentes et les plus impactantes.


Aide à la recherche de causes :
suggestions de causes racines probables (méthodes, matériel, formation, organisation, environnement…) à partir des descriptions d’incidents et d’écarts.


4. Ressources CAPA (formation & équipements)
Mettre à disposition des catalogues de formations et de solutions (EPI, ergonomie…) qui peuvent être recommandés par CAPA-AI et intégrés dans les plans d’action.
Catalogue de formations (consultatif) :
liste des formations disponibles avec thématique, niveau, durée, modules, objectifs, etc.,


possibilité pour CAPA-AI de proposer automatiquement certaines formations en réponse à des incidents ou tendances (ex. formation “manutention manuelle”, “gestes et postures”, “risques chimiques”),


ces formations peuvent être référencées sur les cartes CAPA comme action à réaliser.


Catalogue d’EPI et d’équipements ergonomiques (consultatif) :
liste d’EPI et d’équipements (images, description, normes de conformité, caractéristiques principales),


filtres par type de risque, zone de travail, activité,


mise en avant d’équipements recommandés par CAPA-AI (ex. gants nitrile, masques FFP3, sièges ergonomiques),


possibilité de lier un EPI ou un équipement à une CAPA (l’action devient “déployer tel EPI dans telle zone”).


La planification et le suivi des actions restent toujours centralisés dans la vue Kanban, CAPA-AI jouant le rôle de copilote pour analyser, proposer, prioriser et planifier.
Modules optionnels
Modules optionnels : Impact Calculator, Ergolab, ESGreport, IOT-analysis, mobile app ..etc ne seront pas fonctionnels dans cette version mais on doit les ajouter dans la partie paramètres comme outils optionnels.
 
 NB: L’intégration de l’API pour liaison avec les ERP des départements RH et le type d’hébergement sont des variables à choisir par l’entreprise et peuvent représenter des frais supplémentaires.

Module / Composant
Sous-modules / Sections incluses
Formulaire de première visite SAHTEE (Onboarding global)
Section “Organisation & structure”
Section “Conformité & réglementation”
Section “Incidents & actions”
Section “Santé & expositions”
Section “Objectifs & stratégie SST”
Documents importés
360° Board
Section I – Cartographie des risques
Section II – Zone Indicateurs (Bandeau KPI global ; Onglet 1 : Proactifs (Lead) ; Onglet 2 : Réactifs (Lag) ; Onglet 3 : Synthèse & tendances)
Section III – Alertes et Activités
Module : Healthmeter
1. Statut santé
2. médecine de travail (Fiches médicales & planification des visites)
3. Expositions
4. Health-AI (Assistant IA Santé & Expositions)
Module : Conformity Room
1/ Bibliothèque réglementaire
2/ Statut conformité (suivi et indicateurs)
3/ Audits
4/ Conformity-AI (Assistant IA de conformité)
Module : CAPA Room
1. Statut CAPA
2. Plans CAPA (vue Kanban intelligente)
3. Ressources CAPA (formation & équipements)
4. CAPA-AI 
Modules optionnels
Impact Calculator
Ergolab
ESGreport
IOT-analysis
Mobile app


