using OpenTelemetry.Instrumentation.ServiceFabricRemoting;

// =====================================================================================
//  DISTRIBUTED TRACING - klijentska strana propagacije trace konteksta
// =====================================================================================
//
//  WebApiService je API gateway: on prima HTTP zahtev od React klijenta i dalje poziva
//  UserService / TravelService / SharingService preko Service Fabric Remoting-a
//  (klase u folderu Services/*Proxy.cs koriste ServiceProxy.Create<T>()).
//
//  ServiceProxy interno pravi IServiceRemotingClientFactory tako sto trazi
//  ServiceRemotingProviderAttribute - prvo na assembly-ju remoting interfejsa
//  (Shared.dll), a zatim na entry assembly-ju procesa (WebApiService.exe). Atribut ispod
//  zato zamenjuje podrazumevanu fabriku onom iz OpenTelemetry paketa, koja pre slanja
//  svakog remoting poziva:
//
//    1. otvara klijentski (CLIENT kind) span sa imenom interfejsa i metode,
//    2. ubacuje aktivni W3C trace context i Baggage u zaglavlja remoting poruke.
//
//  Time se span koji je AspNetCore instrumentacija otvorila za dolazni HTTP zahtev
//  povezuje sa span-ovima koje ciljni servis otvara na svojoj strani - jedan trace
//  umesto cetiri nepovezana.
// =====================================================================================

[assembly: TraceContextEnrichedServiceRemotingProvider]
