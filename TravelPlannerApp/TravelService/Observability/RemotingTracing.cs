using OpenTelemetry.Instrumentation.ServiceFabricRemoting;

// =====================================================================================
//  DISTRIBUTED TRACING - propagacija trace konteksta kroz Service Fabric Remoting
// =====================================================================================
//
//  Problem:
//  --------
//  Service Fabric Remoting NIJE HTTP. Poziv iz WebApiService-a ka ovom servisu ide preko
//  binarnog Fabric TCP transporta, pa standardna OpenTelemetry HTTP instrumentacija ne
//  moze da ubaci "traceparent" zaglavlje. Bez toga bi svaki servis pravio svoj, nepovezan
//  trace i cela poenta distribuiranog tracinga bi bila izgubljena.
//
//  Resenje:
//  --------
//  Assembly atribut ispod menja podrazumevani remoting provider Service Fabric-a
//  (FabricTransportServiceRemotingProviderAttribute) verzijom koja:
//
//    - na KLIJENTU  omotava IServiceRemotingClientFactory adapterom koji serijalizuje
//                   aktivni W3C trace context (trace-id, span-id, flags) i Baggage u
//                   custom zaglavlja remoting poruke (IServiceRemotingRequestMessageHeader),
//    - na SERVERU   omotava dispatcher (ServiceRemotingMessageDispatcherAdapter) koji ta
//                   zaglavlja cita, rekonstruise roditeljski kontekst i otvara novi
//                   server-side span kao dete klijentskog span-a.
//
//  Rezultat: jedan trace-id prolazi kroz WebApiService -> Remoting -> ovaj servis -> SQL,
//  pa se u Jaegeru vidi kompletan lanac poziva sa vremenima svakog koraka.
//
//  Napomena o pronalazenju atributa:
//  Service Fabric trazi ServiceRemotingProviderAttribute prvo na assembly-ju u kome su
//  definisani remoting interfejsi (kod nas Shared.dll), a ako ga tamo nema - na entry
//  assembly-ju procesa (ovde TravelService.exe). Zato atribut stoji ovde, u servisu, i
//  Shared projekat (koji je jos uvek .NET Framework 4.8) ne mora da se dira.
//
//  Uz ovo, u ServiceManifest.xml je dodat <Endpoint Name="ServiceEndpointV2" />, jer
//  V2 remoting listener podrazumevano trazi endpoint resurs pod tim imenom.
// =====================================================================================

[assembly: TraceContextEnrichedServiceRemotingProvider]
