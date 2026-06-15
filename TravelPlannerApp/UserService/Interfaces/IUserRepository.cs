using UserService.Models;

namespace UserService.Interfaces
{
    public interface IUserRepository
    {
        Task<User> GetByEmailAsync(string email);
        Task<User> GetByUsernameAsync(string username);
        Task<User> GetByIdAsync(int id);
        Task<User> AddAsync(User user);

        // Admin funkcionalnosti
        Task<List<User>> GetAllAsync();
        Task<bool> UpdateAsync(User user);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}