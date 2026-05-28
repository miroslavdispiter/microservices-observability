using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;
using TravelService.Models;

namespace TravelService.DbContext
{
    public class TravelDbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        public TravelDbContext(DbContextOptions<TravelDbContext> options)
            : base(options) { }

        public DbSet<TravelPlan> TravelPlans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
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
        }
    }
}
