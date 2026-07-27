# Distributed Tracing u TravelPlannerApp

Ovaj dokument opisuje implementaciju šablona **Distributed Tracing** nad postojećom
Service Fabric mikroservisnom arhitekturom, kao deo teme *Implementacija observabilnosti
mikroservisne arhitekture*.

---

## 1. Problem koji se rešava

Bez distribuiranog tracinga, kada korisnik prijavi da je "kreiranje putovanja sporo",
jedini dostupni podaci su agregatne metrike po servisu. One pokazuju *da* je nešto
sporo, ali ne i *gde* u lancu poziva vreme odlazi. Kod četiri servisa i dve baze,
lokalizovanje uzroka svodi se na pogađanje.

Distributed tracing rešava to tako što svakom korisničkom zahtevu dodeljuje jedinstven
`trace-id`, koji ga prati kroz sve servise. Svaki korak (span) beleži svoje trajanje,
pa se ceo put zahteva vidi kao vremenska osa.

### Zašto je ovo na Service Fabric-u netrivijalno

Standardna OpenTelemetry instrumentacija propagira trace kontekst preko HTTP zaglavlja
`traceparent` (W3C Trace Context specifikacija). Međutim, u ovoj arhitekturi:

- React klijent → **WebApiService** ide preko HTTP-a (instrumentacija radi automatski),
- WebApiService → **UserService / TravelService / SharingService** ide preko
  **Service Fabric Remoting-a**, koji je binarni protokol nad Fabric TCP transportom.

Remoting poruka nema HTTP zaglavlja. Bez dodatnog rada, svaki servis bi otvarao novi,
nezavisan trace i veza između njih bila bi izgubljena — što je upravo ono što
distributed tracing treba da spreči.

---

## 2. Rešenje

Koristi se paket [`OpenTelemetry.Instrumentation.ServiceFabricRemoting`](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.ServiceFabricRemoting)
iz zvaničnog OpenTelemetry `dotnet-contrib` repozitorijuma. On menja podrazumevani
Service Fabric remoting provider verzijom koja:

| Strana | Šta radi |
|--------|----------|
| **Klijent** (`TraceContextEnrichedServiceRemotingClientFactoryAdapter`) | Pre slanja poziva otvara `CLIENT` span i serijalizuje aktivni trace kontekst (trace-id, span-id, flags) i Baggage u custom zaglavlja remoting poruke (`IServiceRemotingRequestMessageHeader`) |
| **Server** (`ServiceRemotingMessageDispatcherAdapter`) | Pre izvršavanja metode čita ta zaglavlja, rekonstruiše roditeljski kontekst i otvara `SERVER` span kao dete klijentskog |

Aktivira se assembly atributom `[assembly: TraceContextEnrichedServiceRemotingProvider]`
(fajlovi `Observability/RemotingTracing.cs` u sva četiri servisa).

### Kako Service Fabric pronalazi taj atribut

Service Fabric traži `ServiceRemotingProviderAttribute` ovim redom:

1. na assembly-ju u kome su definisani remoting interfejsi (kod nas `Shared.dll`),
2. ako ga tamo nema — na **entry assembly-ju procesa** (`UserService.exe`,
   `WebApiService.exe`, ...).

Projekat `Shared` je i dalje klasičan .NET Framework 4.8 projekat sa `packages.config`,
u koji je dodavanje modernog NuGet paketa nepotrebno komplikovano. Zato je atribut
stavljen u same servise i oslanja se na korak 2. Time `Shared` ostaje netaknut.

### Šta još ulazi u trace

- **ASP.NET Core instrumentacija** (WebApiService) — root span za dolazni HTTP zahtev.
  Rute `/metrics` i `/health` su filtrirane, jer ih Prometheus poziva na svakih 5
  sekundi i zatrpale bi Jaeger infrastrukturnim saobraćajem.
- **SqlClient instrumentacija** (UserService, TravelService) — span po SQL upitu koji
  EF Core izvrši. Zahvaljujući tome se u jednom trace-u vidi i koliko vremena odlazi na
  bazu, a ne samo na servis.
- **Exception tracking** — neuhvaćen izuzetak se upisuje u span kao `ActivityEvent` sa
  stack trace-om (`AddExceptionAtServer` / `AddExceptionAtClient`, `RecordException`).

---

## 3. Izmenjeni i dodati fajlovi

```
TravelPlannerApp/
├── WebApiService/
│   ├── WebApiService.csproj                 (+ OTLP exporter, + SF Remoting instrumentacija)
│   ├── WebApiService.cs                     (+ .WithTracing(...) uz postojeći .WithMetrics(...))
│   ├── Observability/RemotingTracing.cs     NOVO - assembly atribut (klijentska strana)
│   └── PackageRoot/ServiceManifest.xml      (+ OTEL_* promenljive okruženja)
├── UserService/
│   ├── UserService.csproj                   (+ OTLP exporter, + SF Remoting, + SqlClient)
│   ├── UserService.cs                       (+ TracingSetup.Initialize(context) u konstruktoru)
│   ├── Observability/RemotingTracing.cs     NOVO - assembly atribut
│   ├── Observability/TracingSetup.cs        NOVO - konfiguracija TracerProvider-a
│   └── PackageRoot/ServiceManifest.xml      (+ ServiceEndpointV2, + OTEL_* promenljive)
├── TravelService/                            (isto kao UserService)
└── SharingService/                           (isto, bez SqlClient instrumentacije)

observability/
├── docker-compose.yml                        (+ jaeger servis)
├── grafana/provisioning/datasources/
│   └── datasource.yml                        (+ Jaeger datasource, + tracesToMetrics)
└── grafana/dashboards/
    └── distributed-tracing.json              NOVO - dashboard za tracing
```

### Zašto se TracerProvider u poslovnim servisima pravi ručno

U WebApiService-u je tracing registrovan kroz DI (`builder.Services.AddOpenTelemetry()`),
jer je taj servis i sam ASP.NET Core aplikacija.

U UserService/TravelService/SharingService situacija je drugačija: metrike moraju da
žive u DI kontejneru Kestrel host-a (da bi se izložio `/metrics` endpoint), ali span-ovi
nastaju u **remoting listener-u**, koji se otvara nezavisno od Kestrel-a i potencijalno
pre njega. Zato se `TracerProvider` pravi ručno (`Sdk.CreateTracerProviderBuilder()`) i
to iz **konstruktora servisa** — najranije tačke životnog ciklusa. Da je obrnuto,
instrumentacija ne bi bila registrovana kada stigne prvi remoting poziv i ti span-ovi
bi bili izgubljeni.

### `ServiceEndpointV2` u manifestima

V2 remoting listener podrazumevano traži endpoint resurs pod imenom `ServiceEndpointV2`.
Zato je taj element dodat u `ServiceManifest.xml` za UserService, TravelService i
SharingService. Port dodeljuje Service Fabric dinamički iz opsega aplikacije, pa nema
konflikta sa postojećim fiksnim portovima (7001, 7011, 7012, 7013).

---

## 4. Pokretanje

Redosled je bitan.

```powershell
# 1. Observability stack PRVI (OTLP exporter tiho odustaje ako Jaeger nije dostupan)
cd observability
docker compose up -d

# 2. Provera da su kontejneri podignuti
docker compose ps
```

Zatim se iz Visual Studio pokrene `TravelPlannerApp` (F5), kao i do sada.

Prvo pokretanje posle ovih izmena zahteva **restore novih NuGet paketa** — ako Visual
Studio to ne uradi automatski:

```powershell
cd TravelPlannerApp
dotnet restore TravelPlannerApp.sln
```

Adrese:

| Alat | Adresa | Napomena |
|------|--------|----------|
| Jaeger UI | http://localhost:16686 | pretraga trace-ova |
| Prometheus | http://localhost:9090/targets | provera da su svi servisi "up" |
| Grafana | http://localhost:3001 | admin / admin |
| Swagger | https://localhost:7001/swagger | generisanje saobraćaja |
| Service Fabric Explorer | http://localhost:19080 | stanje klastera |

---

## 5. Verifikacija — korak po korak

### Korak 1: generisati saobraćaj

Kroz Swagger ili React klijent izvršiti nekoliko poziva koji prolaze kroz više servisa,
na primer:

1. `POST /api/auth/register` — WebApiService → UserService → UsersDb
2. `POST /api/auth/login` — isto
3. `POST /api/travelplan` — WebApiService → TravelService → TravelDb
4. `POST /api/sharing` — WebApiService → SharingService (Reliable Collections)

### Korak 2: provera da su span-ovi stigli

Otvoriti http://localhost:16686. U padajućoj listi **Service** treba da se pojave sva
četiri servisa: `WebApiService`, `UserService`, `TravelService`, `SharingService`.

> Ako se pojavi samo `WebApiService`, propagacija kroz remoting ne radi — vidi sekciju
> Troubleshooting, tačku 3.

### Korak 3: provera da je trace POVEZAN

Ovo je ključna provera cele implementacije.

1. U Jaeger UI izabrati **Service: WebApiService**, kliknuti **Find Traces**.
2. Otvoriti trace za `POST /api/travelplan`.
3. U vremenskoj osi treba da se vidi hijerarhija span-ova, otprilike:

```
WebApiService   POST /api/travelplan                        [~120 ms]
└─ WebApiService   ITravelService/Create          (CLIENT)  [~110 ms]
   └─ TravelService   ITravelService/Create       (SERVER)  [~105 ms]
      └─ TravelService   INSERT TravelPlans       (SQL)     [~ 18 ms]
```

Ako se sva četiri servisa pojavljuju u Jaegeru, ali **svaki u zasebnom trace-u** (bez
ugnježdenja), propagacija konteksta ne radi.

### Korak 4: Grafana

Otvoriti http://localhost:3001 → folder **TravelPlannerApp** → dashboard
**TravelPlannerApp - Distributed Tracing**.

- Tabela *Poslednji trace-ovi* treba da prikaže redove sa `traceID`, imenom i trajanjem.
- Klik na `traceID` otvara vremensku osu unutar Grafane.
- U otvorenom span-u, dugme **Trace to metrics** vodi na RED metrike istog servisa
  iz Prometheus-a.

### Korak 5: exception tracking

Namerno izazvati grešku (npr. login sa pogrešnom lozinkom ili gašenje SQL Servera) i
proveriti da se u Jaegeru odgovarajući span prikazuje sa crvenom oznakom i `error`
tagom, uz zabeležen izuzetak.

---

## 6. Troubleshooting

**1. U Jaeger UI nema nijednog servisa**

- Proveriti da je Jaeger pokrenut: `docker compose ps` → `travelplanner-jaeger` mora
  biti `Up`.
- Proveriti da port 4317 nije zauzet drugim procesom:
  `netstat -ano | findstr 4317`
- Proveriti da su servisi zaista restartovani **posle** pokretanja Jaeger-a.
- Uključiti internu dijagnostiku OpenTelemetry-ja: napraviti prazan fajl
  `OTEL_DIAGNOSTICS.json` pored `.exe` fajla servisa sa sadržajem
  `{"LogDirectory": ".", "FileSize": 1024, "LogLevel": "Warning"}` — greške exportera
  se upisuju u log fajl u tom folderu.

**2. Servisi se vide, ali nema podataka za `/api/...` rute**

Rute `/metrics` i `/health` su namerno filtrirane. Ako nema nijednog trace-a, znači da
kroz gateway nije prošao pravi saobraćaj — koristiti Swagger ili React klijent.

**3. Servisi se vide, ali su trace-ovi nepovezani (svaki span svoj trace)**

Ovo znači da assembly atribut nije primenjen. Provere redom:

- Da li `Observability/RemotingTracing.cs` postoji u **sva četiri** projekta i da li se
  projekat uspešno kompajlirao posle dodavanja (atribut mora biti van `namespace` bloka).
- Da li je `ServiceEndpointV2` dodat u `ServiceManifest.xml` poslovnih servisa.
- Da li je aplikacija zaista redeployovana (Service Fabric ume da zadrži staru verziju —
  u Service Fabric Explorer-u proveriti verziju, ili uraditi *Remove Application* pa
  ponovo F5).

Ako i posle ovoga ne radi, alternativa je eksplicitno instanciranje umesto oslanjanja na
atribut. Na serverskoj strani, umesto `this.CreateServiceRemotingInstanceListeners()`:

```csharp
new ServiceInstanceListener(context =>
    new FabricTransportServiceRemotingListener(
        context,
        new ServiceRemotingMessageDispatcherAdapter(
            new ServiceRemotingMessageDispatcher(context, this))),
    "V2Listener")
```

a na klijentskoj strani, umesto `ServiceProxy.Create<T>(uri)`:

```csharp
var factory = new ServiceProxyFactory(callback =>
    new TraceContextEnrichedServiceRemotingClientFactoryAdapter(
        new FabricTransportServiceRemotingClientFactory(callbackMessageHandler: callback)));

factory.CreateServiceProxy<IUserService>(new Uri("fabric:/TravelPlannerApp/UserService"));
```

**4. Greška pri build-u zbog verzija paketa**

Svi OpenTelemetry paketi su usklađeni na `1.15.x` liniju. Ako se neki paket ažurira,
ažurirati i ostale — mešanje glavnih verzija OpenTelemetry SDK-a i instrumentacija
izaziva greške pri restore-u.

**5. SQL span-ovi**

Tekst upita (`db.query.text`) se u aktuelnoj verziji `OpenTelemetry.Instrumentation.SqlClient`
beleži podrazumevano. Ako su potrebne i vrednosti parametara upita, postavlja se
promenljiva okruženja `OTEL_DOTNET_EXPERIMENTAL_SQLCLIENT_ENABLE_TRACE_DB_QUERY_PARAMETERS=true`
— uz oprez, jer parametri mogu sadržati lične podatke.

**6. Poslednji zahtevi pred gašenje servisa nemaju trace**

OTLP exporter grupiše span-ove i šalje ih na svakih nekoliko sekundi. `TracingSetup`
zato registruje `ProcessExit` handler koji poziva `ForceFlush` i `Dispose`. Ako se
proces ubije prinudno (Kill Process u Task Manager-u), taj handler se ne izvršava i
poslednja grupa span-ova se gubi — to je očekivano ponašanje, a ne greška.

**7. Zastareli generisani manifesti u `pkg/Debug`**

Folder `TravelPlannerApp/TravelPlannerApp/pkg/Debug/` sadrži generisane kopije
`ServiceManifest.xml` fajlova. Visual Studio ih regeneriše pri svakom build-u, ali ako
se aplikacija deployuje direktno iz tog foldera (`Publish-NewServiceFabricApplication`)
bez prethodnog build-a, koristiće se stara verzija bez `ServiceEndpointV2` i `OTEL_*`
promenljivih. Uvek uraditi Rebuild pre deploy-a.

---

## 7. Ograničenja i pravci daljeg rada

- **In-memory skladište Jaeger-a.** Korišćeni image je jedinstveni binarni Jaeger v2 sa
  in-memory skladištem, pa se trace-ovi gube pri restartu kontejnera. Za produkciju bi
  bilo potrebno trajno skladište (Elasticsearch, Cassandra ili OpenSearch).
- **Sampling.** Trenutno se beleži 100% zahteva, što je ispravno za lokalni razvoj i
  demonstraciju, ali neodrživo pod produkcionim opterećenjem. Sledeći korak je
  `ParentBasedSampler` sa `TraceIdRatioBasedSampler` ili tail-based sampling na nivou
  OpenTelemetry Collector-a.
- **Nema OpenTelemetry Collector-a.** Servisi šalju span-ove direktno Jaeger-u. Uvođenje
  Collector-a kao međusloja omogućilo bi filtriranje, obogaćivanje i slanje na više
  odredišta bez promene koda servisa.
- **Frontend nije instrumentiran.** Trace počinje na gateway-u; vreme provedeno u
  browseru i mreži do gateway-a nije vidljivo.
- **Korelacija logova i trace-ova** biće uspostavljena u sledećem koraku, uvođenjem
  Grafana Loki-ja i upisivanjem `trace_id` u strukturirane logove.
