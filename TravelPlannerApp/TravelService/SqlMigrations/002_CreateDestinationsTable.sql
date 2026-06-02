-- Migration: 002_CreateDestinationsTable
-- Description: Destinations table for travel plans
-- Date: 2026-06-02

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Destinations')
BEGIN
    CREATE TABLE Destinations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        TravelPlanId INT NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Location NVARCHAR(300) NOT NULL,
        ArrivalDate DATETIME2 NOT NULL,
        DepartureDate DATETIME2 NOT NULL,
        Description NVARCHAR(1000) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_Destinations_TravelPlans 
            FOREIGN KEY (TravelPlanId) 
            REFERENCES TravelPlans(Id) 
            ON DELETE CASCADE
    );

    CREATE INDEX IX_Destinations_TravelPlanId ON Destinations(TravelPlanId);
    CREATE INDEX IX_Destinations_ArrivalDate ON Destinations(ArrivalDate);
    
    PRINT 'Table Destinations created successfully';
END
ELSE
BEGIN
    PRINT 'Table Destinations already exists';
END
GO