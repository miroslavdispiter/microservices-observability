# Pokretanje observability šablona — TravelPlannerApp

Kratko uputstvo za sva tri implementirana šablona. Za detalje o distribuiranom tracingu
videti [DISTRIBUTED-TRACING.md](DISTRIBUTED-TRACING.md).

---

## 0. Zajednička priprema (uvek isti redosled)

```powershell
# 1. Observability alati PRVI
cd travel-planner-app\observability
docker compose up -d
docker compose ps          # prometheus, jaeger, grafana -> svi "Up"

# 2. Tek onda aplikacija
#    Visual Studio -> TravelPlannerApp kao Startup Project -> F5
```

> Redosled je bitan **samo zbog tracinga**: OTLP exporter tiho odustaje ako Jaeger nije
> dostupan i span-ovi se gube. Health checks i metrike rade nezavisno od Dockera.

Sačekati da aplikacija bude zelena u Service Fabric Explorer-u: http://localhost:19080

### Sve adrese na jednom mestu

| Alat | Adresa | Pristup |
|------|--------|---------|
| Swagger (generisanje saobraćaja) | http://localhost:7001/swagger | — |
| Service Fabric Explorer | http://localhost:19080 | — |
| Prometheus | http://localhost:9090 | — |
| Jaeger UI | http://localhost:16686 | — |
| Grafana | http://localhost:3001 | admin / admin |

### Portovi servisa

| Servis | Port | `/health` | `/metrics` |
|--------|------|-----------|------------|
| WebApiService | 7001 | ✔ | ✔ |
| UserService | 7011 | ✔ | ✔ |
| TravelService | 7012 | ✔ | ✔ |
| SharingService | 7013 | ✔ | ✔ |

---

## 1. Health Check API

**Šta radi:** svaki servis izlaže HTTP endpoint koji govori da li je živ i da li su mu
zavisnosti (baza, State Manager) dostupne. Gateway dodatno proverava sva tri servisa.

**Ne zahteva Docker.** Radi čim se pokrene F5.

### Pokretanje

Ništa dodatno — endpointi su aktivni čim servisi startuju.

### Provera

Otvoriti u browseru (ili `curl`):

```
http://localhost:7001/health          # gateway + sva tri downstream servisa
http://localhost:7001/health/live     # samo "da li proces radi"
http://localhost:7001/health/ready    # "da li je spreman da opslužuje saobraćaj"
http://localhost:7011/health          # UserService + provera UsersDb
http://localhost:7012/health          # TravelService + provera TravelDb
http://localhost:7013/health          # SharingService + provera Reliable State
```

Odgovor je JSON:

```json
{
  "status": "Healthy",
  "totalDurationMs": 42.1,
  "checks": [
    { "name": "UsersDb", "status": "Healthy", "durationMs": 38.4 }
  ]
}
```

### Brzi test da provera stvarno radi

Ugasiti SQL Server servis, pa ponovo otvoriti http://localhost:7011/health — status
mora da pređe u `Unhealthy` sa opisom greške. Zatim upaliti SQL Server nazad.

Isto se vidi i na http://localhost:7001/health, jer gateway agregira sva tri servisa.

---

## 2. Application Metrics

**Šta radi:** svaki servis broji i meri (RED metrike + custom poslovne metrike + .NET
runtime), izlaže ih u Prometheus formatu, Prometheus ih skrejpuje, Grafana crta.

**Zahteva Docker** (Prometheus + Grafana).

### Pokretanje

Pokriveno korakom 0.

### Provera lanca, redom

**a) Servis izlaže metrike:**

```
http://localhost:7001/metrics
http://localhost:7011/metrics
http://localhost:7012/metrics
http://localhost:7013/metrics
```

Očekuje se plain-text ispis (`# HELP`, `# TYPE`, pa vrednosti).

**b) Prometheus ih skuplja:**

http://localhost:9090/targets — sva četiri targeta moraju biti **UP**.

Ako je neki DOWN → servis nije pokrenut ili Windows Firewall blokira
`host.docker.internal`.

**c) Grafana ih crta:**

http://localhost:3001 → **Dashboards** → folder **TravelPlannerApp** →
**TravelPlannerApp - Application Metrics**

Sadrži: HTTP request rate / p95 / error rate za gateway, poslovne metrike po servisu
(registracije, prijave, kreirana putovanja, deljeni linkovi), .NET runtime metrike.

### Brzi test

Dashboard je prazan dok nema saobraćaja. Kroz Swagger pozvati nekoliko puta
`POST /api/Auth/login` (namerno i sa pogrešnom lozinkom) — u roku od ~10 sekundi na
dashboard-u rastu `user_service_operations_total` i `user_service_login_failures_total`.

---

## 3. Distributed Tracing

**Šta radi:** svaki HTTP zahtev dobija `trace-id` koji ga prati kroz remoting pozive do
poslovnog servisa i do SQL upita — ceo put jednog zahteva kao jedna vremenska osa.

**Zahteva Docker** (Jaeger + Grafana) **i tačan redosled pokretanja** iz koraka 0.

### Pokretanje

Pokriveno korakom 0. Prvi put posle izmena obavezno **Rebuild Solution** (novi NuGet
paketi).

### Provera

**a) Napraviti jedan poziv** kroz http://localhost:7001/swagger:

```
POST /api/Auth/login
```

(Nema korisnika → prvo `POST /api/Auth/register`.)

Baš login, jer prolazi kroz sve slojeve: HTTP → Remoting → EF Core → SQL.

**b) Jaeger:**

http://localhost:16686 → **Service: WebApiService** → **Find Traces** → otvoriti trace.

Očekivano ugnježdenje:

```
WebApiService    POST /api/Auth/login              SERVER
└─ WebApiService    IUserService/Login             CLIENT
   └─ UserService      IUserService/Login          SERVER
      └─ UserService      SELECT Users             DB
```

**Ovo je ključni test.** Ako su sva četiri span-a u jednom trace-u — radi.
Ako se `UserService` pojavljuje kao **zaseban** trace, propagacija kroz remoting ne
radi → [DISTRIBUTED-TRACING.md](DISTRIBUTED-TRACING.md), troubleshooting tačka 3.

**c) Grafana:**

http://localhost:3001 → folder **TravelPlannerApp** →
**TravelPlannerApp - Distributed Tracing** → klik na `traceID` u tabeli.

Iz otvorenog span-a dugme **Trace to metrics** vodi na RED metrike istog servisa —
tu se šablon 2 i šablon 3 spajaju na jednom ekranu.

### Brzi test hvatanja grešaka

Login sa pogrešnom lozinkom → u Jaegeru se odgovarajući span prikazuje sa `error`
tagom i zabeleženim izuzetkom.

---

## Zaustavljanje

```powershell
cd travel-planner-app\observability
docker compose down
```

Servisi se gase iz Visual Studio ili Service Fabric Explorer-a, kao i obično.

> `docker compose down` briše sve trace-ove (Jaeger ih drži u memoriji). Metrike
> preživljavaju jer Grafana ima trajni volume, ali Prometheus istorija se takođe gubi.

---

## Ako nešto ne radi — brza dijagnostika

| Simptom | Prvo proveriti |
|---------|----------------|
| `/health` vraća `Unhealthy` | Da li SQL Server radi i da li je konekcioni string tačan u `PackageRoot/Config/appsettings.json` |
| Prometheus target DOWN | Da li se `http://localhost:70XX/metrics` otvara iz browsera; Windows Firewall dozvola za dotnet proces |
| Grafana dashboard prazan | Nema saobraćaja — pozvati nešto kroz Swagger i sačekati ~10s |
| Jaeger nema nijedan servis | Da li je `docker compose up -d` izvršen **pre** F5; da li je port 4317 slobodan (`netstat -ano \| findstr 4317`) |
| Trace-ovi nepovezani | Rebuild + redeploy aplikacije; detalji u DISTRIBUTED-TRACING.md, tačka 3 |
