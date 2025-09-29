# RealEstate App — .NET 8 + MongoDB + React (Vite)

Aplicación full-stack para listar propiedades inmobiliarias con filtros, ordenamiento y detalle (propietario, galería e historial).  
Tecnologías: **ASP.NET Core 8 (Web API)**, **MongoDB**, **React + Vite + TypeScript**, **NUnit**.

## Estructura

```
realestate-app/
├─ backend/
│  ├─ RealEstate.Api/
│  ├─ RealEstate.Application/
│  ├─ RealEstate.Domain/
│  ├─ RealEstate.Infrastructure/
│  └─ RealEstate.Tests/
├─ frontend/
│  ├─ src/
│  ├─ public/
│  │  └─ img/           # imágenes de propiedades (tamaño recomendado 1200x900 o 800x600)
│  └─ .env
└─ mongo-dump/
   ├─ owners.json
   ├─ properties.json
   ├─ propertyImages.json
   └─ propertyTrace.json
```

---

## Requisitos

- **.NET SDK 8**  
- **Node.js 18+**  **npm** 
- **MongoDB 6/7** 

> Verifica versiones:
```bash
dotnet --version
node -v
npm -v
mongod --version 
```

---

## Instalación rápida

### Aprovisionamiento en Linux/Ubuntu
```bash
# 1) descomprimir el zip
cd realestate-app

# 2) Backend: restaurar y compilar
cd backend
dotnet restore
dotnet build
dotnet run --project RealEstate.Api

# 3) Frontend: deps
cd frontend
npm install
npm run dev

# 4) MongoDB: arrancar servicio
sudo systemctl start mongod
sudo systemctl enable mongod 

# 5) Importar dataset
cd ..
mongoimport --db realstate --collection owners         --drop --file mongo-dump/owners.json         --jsonArray
mongoimport --db realstate --collection properties     --drop --file mongo-dump/properties.json     --jsonArray
mongoimport --db realstate --collection propertyImages --drop --file mongo-dump/propertyImages.json --jsonArray
mongoimport --db realstate --collection propertyTrace  --drop --file mongo-dump/propertyTrace.json  --jsonArray

# 6) Crear índices
mongosh <<'EOF'
use realstate
db.properties.createIndex({ Name: "text", Address: "text" })
db.properties.createIndex({ Price: 1 })
db.properties.createIndex({ IdProperty: 1 }, { unique: true })
db.owners.createIndex({ IdOwner: 1 }, { unique: true })
db.propertyImages.createIndex({ IdProperty: 1, Enabled: 1 })
db.propertyTrace.createIndex({ IdProperty: 1 })
EOF
```

### Aprovisionamiento en Windows (PowerShell como Admin)
```powershell
# 1) Descomprimir
cd realestate-app

# 2) Backend
cd backend
dotnet restore
dotnet build
dotnet run --project RealEstate.Api

# 3) Frontend
cd ..\frontend
npm install
npm run dev

# 4) Asegúrate de que el servicio MongoDB está iniciado (Servicios de Windows)
# 5) Importar dataset (ajusta la ruta absoluta si lo necesitas):
mongoimport --db realstate --collection owners         --drop --file ..\mongo-dump\owners.json         --jsonArray
mongoimport --db realstate --collection properties     --drop --file ..\mongo-dump\properties.json     --jsonArray
mongoimport --db realstate --collection propertyImages --drop --file ..\mongo-dump\propertyImages.json --jsonArray
mongoimport --db realstate --collection propertyTrace  --drop --file ..\mongo-dump\propertyTrace.json  --jsonArray

# 6) Índices (desde 'mongosh')
mongosh
use realstate
db.properties.createIndex({ Name: "text", Address: "text" })
db.properties.createIndex({ Price: 1 })
db.properties.createIndex({ IdProperty: 1 }, { unique: true })
db.owners.createIndex({ IdOwner: 1 }, { unique: true })
db.propertyImages.createIndex({ IdProperty: 1, Enabled: 1 })
db.propertyTrace.createIndex({ IdProperty: 1 })
exit
```

---

## Configuración de entorno

### Backend — `appsettings.Development.json`
```json
{
  "Mongo": {
    "ConnectionString": "mongodb://localhost:27017",
    "Database": "realstate"
  },
  "AllowedHosts": "*"
}
```

### Frontend — `.env`
```
VITE_API_URL=http://localhost:5016
```

---

## Ejecución

### Backend (API)
```bash
cd backend
dotnet run --project RealEstate.Api
# http://localhost:5016
```

### Frontend (React + Vite)
```bash
cd frontend
npm run dev
# http://localhost:5173

## Test
npm run test
# o con UI:
npm run test:ui
# cobertura:
npm run test:coverage
```

---

## Pruebas (NUnit)
```bash
cd backend
dotnet test RealEstate.Tests/RealEstate.Tests.csproj --collect:"XPlat Code Coverage"
```

---

## Endpoints principales

- `GET /api/properties`  
- `GET /api/properties/{idProperty}`

---

## Imágenes

Colocar en `frontend/public/img/` con el mismo nombre que en `propertyImages.json`.  
Recomendado **1200x900** o `aspect-ratio: 4/3`.

---

## Arquitectura

- **Domain**: entidades puras  
- **Application**: lógica de negocio  
- **Infrastructure**: acceso a MongoDB  
- **Api**: controladores REST  
- **Tests**: NUnit

---

## Troubleshooting

- `E11000 duplicate key`: usar `--drop`
- El frontend no ve el backend: revisar CORS y `.env`
- Cambiar puerto backend: `ASPNETCORE_URLS=http://localhost:5020 dotnet run --project RealEstate.Api`

---
