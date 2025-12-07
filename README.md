# CRUD KBO – API Entreprises

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

Application Node.js / TypeScript permettant de gérer des entreprises, leurs adresses, activités, contacts, dénominations et établissements.  
L'API est documentée via Swagger, validée via Zod, et optimisée pour l'import massif de données (CSV).

---

## Fonctionnalités principales

### Création d'une entreprise
- Vérification du **code d'activité** (NACE) via les codes importés depuis un CSV
- Possibilité d'ajouter des **établissements** lors de la création

### Lecture
- Affichage d'une entreprise par numéro
- Recherche par nom
- Retourne toutes les relations :
  - Adresses  
  - Activités  
  - Contacts  
  - Dénominations  
  - Établissements  

### Mise à jour
- Modification des informations principales d'une entreprise
- Mise à jour d'un établissement existant

### Suppression
- Suppression d'une entreprise **avec cascade** sur toutes ses données associées
- Supression d'un établissement

---

## Choix techniques

### Stack principale

#### TypeScript
- Typage statique pour réduire les erreurs et améliorer la maintenabilité
- Autocomplétion, refactoring facilité, détection d'erreurs avant compilation

#### TypeORM + PostgreSQL
- ORM robuste avec support complet des relations complexes
- Utilisation de l’approche Data Mapper de TypeORM. Les entités définissent les
données et la logique métier est centralisée dans les services. Cette approche est adaptée pour un
projet structuré, facilite les tests et respecte une architecture propre.
- PostgreSQL pour ses performances, ACID, et fonctions avancées (ILIKE)
- Cascade delete



#### Zod
- Validation runtime avec génération automatique des types TypeScript
- Une seule source de vérité pour la validation et les types
- Intégration parfaite avec TypeScript (vs Joi/Yup)

#### Swagger (OpenAPI 3)
- Documentation interactive auto-générée depuis les schémas Zod
- Testable directement depuis le navigateur
- Génération automatique de clients API

### Optimisations

#### pg-copy-streams
- Import massif de CSV (millions de lignes)
- 10-100x plus rapide que des INSERT classiques
- Utilisation de tables temporaires + COPY PostgreSQL

#### Architecture en couches
- **Controllers** : Gestion des routes HTTP et réponses
- **Services** : Logique métier et orchestration
- **Repositories** : Accès aux données (pattern Repository)
- **Validators** : Validation des entrées avec Zod
- **Avantage** : Séparation des responsabilités, testabilité, maintenabilité

#### Index PostgreSQL
- Index sur toutes les clés étrangères pour optimiser les jointures
- Index sur `denomination` pour recherches 
- Recherches 10-100x plus rapides sur des tables de millions de lignes

---

## Modèle conceptuel de données

<img width="4383" height="2062" alt="Untitled diagram-2025-12-05-214301" src="https://github.com/user-attachments/assets/69e11d7d-01c2-48fd-aa19-deda94c9488a" />

---

## Relations du modèle de données

Le modèle est centré sur l’entité **Enterprise**, identifiée par `EnterpriseNumber`.  
Toutes les autres tables y sont reliées via une clé étrangère.

### Relations :

- **Enterprise 1—N Address**
- **Enterprise 1—N Contact**
- **Enterprise 1—N Denomination**
- **Enterprise 1—N Branch**
- **Enterprise 1—N Establishment**
- **Enterprise 1—N Activity**

---

## Architecture du projet
```
kbo-api/
├── src/
│   ├── controllers/        # Routes Express et gestion des endpoints API
│   ├── entities/           # Entités TypeORM (modèles de données)
│   ├── middleware/         # Middleware de validation Zod
│   ├── repositories/       # Couche d'accès aux données (pattern Repository)
│   ├── scripts/            # Scripts d'import CSV (streaming + PostgreSQL COPY)
│   │   └── csv/            # Fichiers CSV à importer (non versionnés)
│   ├── services/           # Logique métier et interactions avec la base de données
│   ├── swagger/
│   │   ├── routes/         # Génération des routes pour Swagger
│   │   └── swagger.ts      # Configuration Swagger + génération openapi.json
│   ├── validators/         # Schémas Zod pour la validation des requêtes
│   ├── app.ts              # Configuration de l'application Express
│   ├── datasource.ts       # Connexion TypeORM + configuration PostgreSQL
│   └── index.ts            # Point d'entrée du serveur Express
├── docs/
│   └── openapi.json        # Fichier OpenAPI généré
├── .env                    # Variables d'environnement (non versionné)
├── .env.example            # Template des variables d'environnement
├── .gitignore              # Fichiers à ignorer par Git
├── docker-compose.yml      # Configuration Docker pour PostgreSQL
├── package.json            # Dépendances et scripts npm
├── tsconfig.json           # Configuration TypeScript
├── LICENSE                 # Licence MIT
└── README.md               # Documentation du projet
```
> **Note :** Les fichiers CSV dans `src/scripts/csv/` et le fichier `.env` ne sont pas versionnés dans Git.  
> Voir les sections "Variables d'environnement" et "Importation des données" pour plus d'infos.

---

## Validation via Zod

Toutes les requêtes POST et PUT utilisent un **middleware Zod** :
```typescript
router.post("/", validate(CreateEnterpriseSchema), async (req, res) => {
  const result = await service.create(req.body);
  res.status(201).json(result);
});
```

Les schémas de validation Zod sont définis dans :
```
src/validators/
```

Ces schémas sont utilisés via le middleware `validate()` pour valider automatiquement les requêtes entrantes.

---

## Documentation Swagger

Une documentation interactive complète de l'API est disponible à :

**http://localhost:3000/docs**

Les schémas OpenAPI sont générés automatiquement à partir des fichiers dans :
```
src/swagger/

src/validators/
```

La documentation inclut :
- Tous les endpoints disponibles
- Les schémas Zod convertis en schémas OpenAPI
- Les schémas de requête/réponse
- Les exemples d'utilisation
- La possibilité de tester les endpoints directement

Un fichier statique OpenAPI JSON est également disponible à :

**http://localhost:3000/api-docs.json**


---

## Optimisations SQL (Index)

Pour améliorer les performances, notamment lors des recherches par `enterpriseNumber` ou par `denomination, les index suivants ont été ajoutés :
```sql
CREATE INDEX idx_enterprise_number ON enterprise("enterpriseNumber");
CREATE INDEX idx_activity_enterprise ON activity("entityNumber");
CREATE INDEX idx_address_enterprise ON address("entityNumber");
CREATE INDEX idx_denomination_enterprise ON denomination("entityNumber");
CREATE INDEX idx_contact_enterprise ON contact("entityNumber");
CREATE INDEX idx_establishment_enterprise ON establishment("enterpriseNumber");
CREATE INDEX idx_denomination_name_ilike ON denomination(denomination text_pattern_ops);
```

---

## Importation des données (CSV)

L'application utilise plusieurs fichiers CSV issus de la **Banque-Carrefour des Entreprises (BCE / KBO)**. Ces fichiers ne sont pas fournis dans ce dépôt et doivent être téléchargés manuellement.

### Où télécharger les CSV ?

Les jeux de données officiels sont disponibles ici en créant un compte utilisateur :

[https://economie.fgov.be/fr/themes/entreprises/banque-carrefour-des/services-pour-tous/reutilisation-de-donnees/banque-carrefour-des-0](https://economie.fgov.be/fr/themes/entreprises/banque-carrefour-des/services-pour-tous/reutilisation-de-donnees/banque-carrefour-des-0)

Dans la section **Open Data KBO**, télécharger les fichiers suivants :
- `Address.csv`
- `Activity.csv`
- `Contact.csv`
- `Denomination.csv`
- `Establishment.csv`
- `Enterprise.csv`
- `Code.csv` (NACE / codes d'activité)

### Où placer les fichiers ?

Placer chaque CSV dans :
```
src/scripts/csv/
```

Le dossier doit ressembler à ceci :
```
src/scripts/csv/
├── address.csv
├── activity.csv
├── contact.csv
├── denomination.csv
├── establishment.csv
├── enterprise.csv
└── code.csv
```

### Comment importer les données ?

Chaque fichier dispose d'un script d'import rapide (streaming + `pg-copy-streams`).

Les imports utilisent :
- Une table temporaire
- `pg-copy-streams` pour des performances maximales
- Des requêtes SQL massives

Commandes d'import avec ts-node :
```bash
npx ts-node src/scripts/import-enterprises.ts
npx ts-node src/scripts/import-activities.ts
npx ts-node src/scripts/import-addresses.ts
npx ts-node src/scripts/import-codes.ts
npx ts-node src/scripts/import-contacts.ts
npx ts-node src/scripts/import-denominations.ts
npx ts-node src/scripts/import-establishments.ts

```

Les scripts existent pour :
- Entreprises
- Activités
- Adresses
- Contacts
- Dénominations
- Établissements
- Codes NACE

---

## Installation et lancement

### 1. Cloner le projet
```bash
git clone git@github.com:lilipix/crud-kbo.git
cd crud-kbo
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement

Crée un fichier `.env` à la racine du projet :
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=kbo_db
```

> Un fichier `.env.sample` est fourni comme modèle.  

### 4. Lancer PostgreSQL avec Docker
```bash
docker compose up -d
```

### 5. (Optionnel) Générer la documentation OpenAPI
```bash
npm run openapi:generate
```

### 6. Lancer le serveur
```bash
npm run dev
```

Le serveur tourne sur :

**http://localhost:3000**

---

## Routes principales

| Méthode | Route | Description |
|---------|-------|-------------|
| **POST** | `/enterprise` | Créer une entreprise |
| **GET** | `/enterprise/number/:enterpriseNumber` | Obtenir une entreprise par numéro |
| **GET** | `/enterprise/name/:denomination` | Recherche textuelle par nom |
| **PUT** | `/enterprise/:enterpriseNumber` | Modifier une entreprise |
| **DELETE** | `/enterprise/:enterpriseNumber` | Supprimer une entreprise + cascade |
| **POST** | `/enterprise/:enterpriseNumber/establishment` | Créer un établissement |
| **PUT** | `/enterprise/establishment/:establishmentNumber` | Modifier un établissement |
| **DELETE** | `/enterprise/:enterpriseNumber/:establishmentNumber` | Supprimer un établissement |

---

## Tester l'API

Toutes les fonctionnalités peuvent être testées directement via :

**http://localhost:3000/docs**

---

## Notes supplémentaires

- Les cascades de suppression sont gérées par TypeORM (`onDelete: "CASCADE"`)
- La validation Zod s'applique automatiquement via le middleware
- Les imports CSV sont optimisés pour gérer des millions de lignes

---

## Licence

MIT
