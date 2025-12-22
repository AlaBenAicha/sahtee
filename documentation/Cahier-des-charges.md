# **Cahier des charges fonctionnel**

**Plateforme SAHTEE**

**Nom du projet :** SAHTEE — plateforme de gestion de santé et sécurité au travail pour les entreprises  
 **Propriétaire du document :** Abderrahmen Abdelkabir  
 **Date de création :** 26/11/2025  
 **Dernière mise à jour :** 06/12/2025

---

## **1\. Vue d’ensemble du projet**

### **1.1 Type de projet**

plateforme en ligne intégrant plusieurs modules HSE (Healthmeter,Conformity Room, CAPA Room) et une interface de tableau de bord avec un outil intelligent d’assistance.

### **1.2 Problématique**

Les entreprises gèrent aujourd’hui leurs obligations réglementaires (ISO 45001, OSHA, Code du Travail, etc.), les plans d’actions correctifs/préventifs et le suivi de la santé des collaborateurs sur des outils disparates. Cette multiplicité entraîne des pertes de temps, des risques d’erreurs et une visibilité limitée sur les priorités.

Il est nécessaire de **centraliser** l’ensemble des données HSE, de rendre la **conformité traçable**, de **piloter les plans d’actions** et de **suivre les indicateurs de santé et de sécurité en temps réel** pour prévenir et agir efficacement.

### **1.3 Solution proposée**

SAHTEE propose une plateforme web modulable comportant :

* **Healthmeter** : surveillance de la santé collective et gestion des dossiers médicaux, suivi des expositions professionnelles et alertes associées.  
* **Conformity Room** : bibliothèque réglementaire (normes ISO, OSHA, COR, IAP…) avec suivi du statut des normes, progression de la conformité, planification d’audits et intégration aux plans CAPA.  
* **CAPA Room** : gestion des plans d’actions hiérarchisés (vue Kanban et liste), des formations (catalogue, progression individuelle, certifications), des équipements/EPI et incidents, ainsi qu’une planification intelligente via IA.

Le tout est géré par 2 outils à disposition :

* **360° Board** : tableau de bord centralisé qui présente les indicateurs clés issus de chaque module (taux de AT/MP, absentéisme, heures travaillées, conformité…) ainsi que la cartographie des risques et un flux d’alertes/actions.

* **SafetyBot** : assistant conversationnel pour assurer l’encadrement du manager dans l’utilisation de la plateforme et les fonctionnalités.

Les **modules optionnels** (Impact Calculator, Ergolab, ESGreport, IOT-analysis, mobile app, etc.) ne seront pas fonctionnels dans cette version (en cours), mais pourront être ajoutés comme options.

L’intégration de l’API pour liaison avec les **ERP des départements RH** et le **type d’hébergement** sont des variables à choisir par l’entreprise et peuvent représenter des frais supplémentaires.

## **2\. Histoires utilisateurs (User Stories)**

**Responsable QHSE** :

1. Se connecter à SAHTEE, remplir et mettre à jour le formulaire de première visite et importer les documents de référence.

2. Consulter le **360° Board** pour analyser les indicateurs et la cartographie des risques.

3. Gérer la bibliothèque réglementaire et le planning des audits dans **Conformity Room**.

4. Créer, suivre et planifier les actions dans **CAPA Room** (vue Kanban et planification IA).

5. Utiliser SafetyBot et les modules IA (Health-AI,Conformity‑AI, CAPA‑AI) pour analyser les écarts et recommander des actions.

6. **Dans Healthmeter, ne consulter que le statut santé agrégé** (tuiles et tendances), sans accès aux données de santé individuelles.

**Responsable RH** :

1. Se connecter à SAHTEE et accéder au **360° Board**.

2. Consulter les indicateurs globaux (accidents, conformité, absences, formations, CAPA) pour participer aux décisions RH et coordonner les mesures de gestion avec le responsable QHSE et le médecin du travail .

**Chef de département / Chef d’atelier** :

1. Se connecter à SAHTEE et accéder au **360° Board** pour voir la cartographie des risques et les indicateurs liés à son périmètre.

2. Accéder à **CAPA Room** pour consulter les actions qui lui sont assignées, mettre à jour leur avancement et déclarer des incidents.

3. Suivre les recommandations EPI ou formations émises par l’IA et les intégrer dans les actions CAPA.

**Médecin du travail** :

1. Se connecter à SAHTEE et accéder à **Healthmeter** pour gérer les fiches médicales, les visites et les expositions professionnelles.

2. Consulter le **360° Board** pour une vue d’ensemble des indicateurs santé/sécurité.

3. Créer des actions de prévention dans **CAPA Room** à partir des recommandations AI (ergonomie, suivi RPS, gestion des expositions).

   ## **3\. Interface utilisateur & expérience (UX/UI)**

**Écrans / Pages à prévoir :**  
 (voir lien descriptif de l’interface : [*Interface utilisateur & expérience (UX/UI) SAHTEE*](https://docs.google.com/document/d/1dEA-mHQrqwspnNNQIGkGT7fY1eLGdWkk_vDswJ4WUBI/edit?usp=sharing))

L’interface comprend notamment :

* Le **Formulaire de première visite SAHTEE (Onboarding global)**

* Le **360° Board** (cartographie des risques, indicateurs clés, alertes & activités)

* Les modules :**Healthmeter**, **Conformity Room**,  **CAPA Room**

* Les interfaces de **SafetyBot et autres outils AI** 

* Les écrans des **modules optionnels** (affichés mais non fonctionnels à ce stade)

**Maquettes :** Voir captures d’écran imprimées 

## **4\. Parcours utilisateur (User Flow) :**

| \# | Scénario / Étape | Utilisateur principal | Modules / Écrans SAHTEE | Actions principales | Résultat / sortie clé |
| :---- | ----- | ----- | ----- | ----- | ----- |
| 1 | Demande de démo | Direction / QHSE / RH | Site web (hors plateforme) | L’entreprise contacte SAHTEE pour demander une démo (formulaire, mail, téléphone) en précisant via le formulaire de démo secteur, taille, sites, interlocuteurs…etc | Planification d’une démo SAHTEE avec les parties prenantes de l’entreprise. |
| 2 | Démo de la plateforme | Direction / QHSE / RH / Médecin | Version démo SAHTEE | Présentation des modules (360° Board, Conformity Room, Healthmeter, CAPA Room, SafetyBot) et des cas d’usage principaux. | Décision d’adopter SAHTEE et validation des contours du projet (modules activés, rôles clés). |
| 3 | Création de l’espace entreprise | Administrateur SAHTEE  | Back-office (hors vue client) | Création d’un environnement SAHTEE dédié, paramétrage initial (nom de l’entreprise, logo, domaines, premiers utilisateurs et rôles). | Espace SAHTEE prêt, administrateur interne (QHSE) reçoit ses identifiants. |
| 4 | Première connexion administrateur | Responsable QHSE / Administrateur | Page de connexion SAHTEE, menu principal | Connexion à SAHTEE, vérification des accès, découverte du menu principal. | Accès à la plateforme et déclenchement du formulaire de première visite. |
| 5 | Première visite – Organisation | Responsable QHSE / Administrateur | Formulaire 1ère visite – « Organisation & structure » | Saisie des secteurs d’activité, nombre de travailleurs, répartition par site/département, coordonnées Direction, QHSE/SST, RH, Médecin du travail, représentants du personnel, description des sites/ateliers. | Données de base d’organisation stockées et prêtes à alimenter 360° Board et les modules. |
| 6 | Première visite – Conformité | Responsable QHSE | Formulaire – « Conformité & réglementation » | Indication de l’existence ou non d’ISO 45001, DUER, procédures SST, plans d’urgence, historique synthétique des audits et certifications. | Alimentation initiale de **Conformity Room** (niveau de maturité réglementaire). |
| 7 | Première visite – Incidents & actions | Responsable QHSE | Formulaire – « Incidents & actions » | Déclaration de l’existence d’un système de gestion des incidents, volume global d’incidents graves/récurrents, plan d’actions SST existant. | Alimentation de **CAPA Room** (première vision des pratiques d’incidentologie et d’actions). |
| 8 | Première visite – Santé & expositions | Médecin / QHSE | Formulaire – « Santé & expositions » | Identification des principaux risques santé (TMS, RPS, chimique, bruit…), modalités de suivi médical, expositions déjà surveillées (bruit, solvants, poussières, etc.). | Alimentation initiale de **Healthmeter** (profil de risques santé et expositions). |
| 9 | Première visite – Objectifs SST | Responsable QHSE / Direction | Formulaire – « Objectifs & stratégie SST » | Saisie des objectifs de conformité et de performance SST ; option pour laisser l’IA proposer des objectifs recommandés selon le secteur et les réponses. | Définition de la « photographie de départ » et des objectifs ; base pour les recommandations IA et le suivi dans le temps. |
| 10 | Import des documents de référence | Responsable QHSE / Médecin | Formulaire – zone « Documents importés » | Import du DUER, rapports d’audit, politique SST, plans de formation, procédures, états de visites médicales, anciens tableaux d’exposition… | Base documentaire structurée utilisée par **Conformity-AI**, **Health-AI**, **CAPA-AI** et visible dans les modules. |
| 11 | Calcul de la « photographie de départ » | Système \+ IA | 360° Board, modules de base | Après validation du formulaire, la plateforme agrège les données et documents importés pour produire une première vue des indicateurs et de la cartographie des risques. | 360° Board initial, indicateurs et cartographie estimée, prêts à être affinés par les données opérationnelles (incidents, audits, santé, CAPA). |
| 12 | Consultation du 360° Board | Responsable QHSE / Direction | 360° Board | Consultation du bandeau KPI global, de la cartographie des risques, des onglets lead/lag et des alertes récentes ; possibilité d’analyse automatique. | Vision synthétique de l’état SST et des priorités, point de départ du pilotage quotidien. |
| 13 | Déclaration d’un incident – terrain | Employé / Chef d’atelier | Formulaire incident via QR code ou mobile app | L’employé scanne un QR code ou ouvre l’app, remplit un formulaire simplifié : date/heure, lieu, description, type (AT, quasi-accident, situation dangereuse), gravité, personnes affectées, pièces jointes. | Incident enregistré, **identifiant unique** créé, incident classé par site/service, prêt à générer une CAPA. |
| 14 | Déclaration d’un incident – manager | Manager / Responsable QHSE | CAPA Room – section « Incidents » | Le manager accède à la section « Incidents » dans CAPA Room via la plateforme, remplit un formulaire détaillé si besoin et valide l’incident. | Incident saisi ou complété via la plateforme, harmonisé avec les déclarations terrain. |
| 15 | Création auto de CAPA depuis un incident | Système \+ CAPA-AI | CAPA Room – Vue Kanban | Le système crée une CAPA (ou brouillon) associée à l’incident, la place dans « CAPA urgentes » ou « À planifier » selon la criticité ; CAPA-AI propose une première description et des pistes d’actions. | CAPA tracée dans la vue Kanban, prête à être priorisée, planifiée et suivie. |
| 16 | Planification d’un audit | Auditeur interne / QHSE | Conformity Room – « Audits » | L’auditeur ouvre « Audits », consulte le statut de conformité d’une norme, clique sur « Planifier un audit », saisit titre, site/périmètre, norme/domaine, type (interne/externe), date prévue, auditeur. | Audit créé, inscrit dans le tableau et le calendrier, notifications envoyées aux personnes concernées. |
| 17 | Conduite et clôture d’un audit | Auditeur interne | Conformity Room – Audits \+ templates d’audit | Utilisation de la grille d’audit, saisie des observations, écarts et recommandations, ajout de pièces jointes ; à la clôture, conversion des écarts en CAPA dans CAPA Room. | Rapport d’audit complet, écarts liés à des CAPA tracées, progression de conformité mise à jour. |
| 18 | Gestion d’un plan d’action (CAPA) | Responsable QHSE / Manager | CAPA Room – Vue Kanban \+ CAPA-AI | Gestion des CAPA (création, édition, affectation, priorité, échéance) ; déplacement des cartes entre CAPA urgentes / À planifier / À faire / En cours / Terminées ; CAPA-AI aide à prioriser et planifier. | Plan d’actions structuré, visibilité claire des actions en cours, indicateurs CAPA alimentés et visibles dans 360° Board. |
| 19 | Planification intelligente des CAPA | Responsable QHSE / Manager | CAPA Room – planification IA | Lancement de la planification IA, visualisation de la timeline hebdomadaire et de la matrice de priorité, ajustement et validation du planning proposé. | Planning optimisé des CAPA (répartition dans le temps, par équipe), réduction des conflits et des retards. |
| 20 | Consultation de Healthmeter – Statut santé | Médecin du travail / QHSE | Healthmeter – « Statut santé » | Consultation des tuiles de synthèse (cas actifs, absentéisme santé, alertes) et des graphiques (TMS, RPS, durée moyenne d’arrêt, etc.). | Vision globale de l’état de santé au travail et des signaux d’alerte. |
| 21 | Mise à jour fiches médicales et visites | Médecin du travail | Healthmeter – Médecine du travail (fiches \+ planning) | Accès aux fiches médicales, saisie/mise à jour des diagnostics, restrictions, visites ; utilisation des templates ; planification et suivi du calendrier des visites (à programmer, planifiées, réalisées, etc.). | Dossiers médicaux à jour, planning des visites maîtrisé, alertes sur visites en retard ou à venir. |
| 22 | Suivi des expositions professionnelles | Médecin du travail / QHSE | Healthmeter – « Expositions » | Consultation des niveaux mesurés, % des valeurs limites, historique d’exposition, alertes ; filtrage par site, atelier, poste. | Identification des facteurs d’exposition critiques, base pour des CAPA de prévention. |
| 23 | Analyse santé / expositions via Health-AI | Médecin du travail / QHSE | Healthmeter – Health-AI | Demande d’analyse des tendances (TMS, RPS, pathologies, expositions) ; Health-AI met en avant les groupes à risque et propose des axes de prévention (ergonomie, RPS, etc.). | Recommandations de prévention prioritaires que le QHSE peut transformer en CAPA préventives dans CAPA Room. |
| 24 | Consultation et suivi des formations | Manager / RH | CAPA Room – Ressources CAPA (Formations) \+ espace employé | le manager et le RH suivent l’état des formations essentielles ; certificats générés à 100 % de complétion. | Traçabilité des formations SST, certificats archivés, indicateurs de formation alimentés. |
| 25 | Utilisation des ressources EPI / ergonomie | Chef d’atelier / QHSE | CAPA Room – Ressources CAPA (EPI & équipements ergonomiques) | Consultation du catalogue d’EPI et d’équipements ; filtres par type de risque ; CAPA-AI met en avant des recommandations en fonction des incidents et expositions ; lien des EPI avec des CAPA. | Alignement entre risques, EPI/équipements et actions CAPA ; meilleure justification des investissements. |
| 26 | Analyse de conformité via Conformity-AI | Responsable QHSE / Auditeur interne | Conformity Room – Conformity-AI | Lancement de l’analyse IA : calcul du taux global de conformité, mise en avant des domaines en retard, détection de failles (absence d’audit récent, absence de preuves, etc.), propositions d’actions. | Vision claire des écarts de conformité et génération de CAPA ou d’audits ciblés. |
| 27 | Questions transversales à SafetyBot | Tous utilisateurs (selon droits) | SafetyBot (barre latérale / panneau de chat) | Questions sur la plateforme ou la SST ; SafetyBot interroge les données et la base HSE et propose une réponse structurée avec liens internes (rapports, consignes, procédures, écrans SAHTEE pertinents). | Accès rapide à l’information et au support sans quitter le contexte de travail ; gain de temps pour les managers et les équipes. |
| 28 | Suivi global par le responsable RH | Responsable RH | 360° Board \+ modules (lecture) | Consultation des indicateurs SST (AT/MP, jours perdus, absentéisme, formations, CAPA) ; échanges avec QHSE et Médecin pour organiser campagnes de prévention et ressources. | Intégration de la dimension SST dans la politique RH (QVT, prévention, formation, aménagement du travail). |
| 29 | Pilotage stratégique par la Direction | Direction générale | 360° Board \+ Rapports PDF/Excel | Consultation synthétique des indicateurs clés (conformité, accidents, jours perdus, CAPA, santé) ; génération de rapports consolidés ; utilisation de safetybot pour des questions globales. | Décisions stratégiques mieux informées, communication facilitée avec les parties prenantes internes et externes (CA, inspection, certification). |

## 

## 

## 
