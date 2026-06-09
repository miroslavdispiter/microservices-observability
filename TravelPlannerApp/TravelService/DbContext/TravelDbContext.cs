using Microsoft.EntityFrameworkCore;
using TravelService.Models;

namespace TravelService.DbContext
{
    public class TravelDbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        public TravelDbContext(DbContextOptions<TravelDbContext> options)
            : base(options) { }

        public DbSet<TravelPlan> TravelPlans { get; set; }
        public DbSet<Destination> Destinations { get; set; }
        public DbSet<Activity> Activities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Db - TravelPlan
            modelBuilder.Entity<TravelPlan>(entity =>
            {
                entity.ToTable("TravelPlans");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.UserId)
                    .IsRequired();

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.StartDate)
                    .IsRequired();

                entity.Property(e => e.EndDate)
                    .IsRequired();

                entity.Property(e => e.Budget)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Notes)
                    .HasMaxLength(2000);

                entity.Property(e => e.CreatedAt)
                    .IsRequired();
            });

            // Db - Destination
            modelBuilder.Entity<Destination>(entity =>
            {
                entity.ToTable("Destinations");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.TravelPlanId)
                    .IsRequired();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Location)
                    .IsRequired()
                    .HasMaxLength(300);

                entity.Property(e => e.ArrivalDate)
                    .IsRequired();

                entity.Property(e => e.DepartureDate)
                    .IsRequired();

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.CreatedAt)
                    .IsRequired();

                entity.HasOne(d => d.TravelPlan)
                    .WithMany()
                    .HasForeignKey(d => d.TravelPlanId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Db - Activities
            modelBuilder.Entity<Activity>(entity =>
            {
                entity.ToTable("Activities");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.TravelPlanId)
                    .IsRequired();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Date)
                    .IsRequired();

                entity.Property(e => e.Time);

                entity.Property(e => e.Location)
                    .HasMaxLength(300);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.EstimatedCost)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Status)
                    .IsRequired();

                entity.Property(e => e.CreatedAt)
                    .IsRequired();

                entity.HasOne(a => a.TravelPlan)
                    .WithMany()
                    .HasForeignKey(a => a.TravelPlanId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}