-- Migration: 001_CreateTravelPlansTable
-- Description: Initial table for travel plans
-- Date: 2026-06-02

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TravelPlans')
BEGIN
    CREATE TABLE TravelPlans (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(1000) NULL,
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NOT NULL,
        Budget DECIMAL(18,2) NOT NULL DEFAULT 0,
        Notes NVARCHAR(2000) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );

    CREATE INDEX IX_TravelPlans_UserId ON TravelPlans(UserId);
    CREATE INDEX IX_TravelPlans_StartDate ON TravelPlans(StartDate);
    
    PRINT 'Table TravelPlans created successfully';
END
ELSE
BEGIN
    PRINT 'Table TravelPlans already exists';
END
GO