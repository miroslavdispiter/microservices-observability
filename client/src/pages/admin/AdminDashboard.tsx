import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin/AdminAPIService";
import { Navbar } from "../../components/Navbar";
import { UserList } from "../../components/admin/UserList";
import { UserModal } from "../../components/admin/UserModal";
import { ChangePasswordModal } from "../../components/admin/ChangePasswordModal";
import type { User } from "../../models/user/User";
import type { UpdateUserDto } from "../../dtos/user/UpdateUserDto";
import type { ChangePasswordDto } from "../../dtos/user/ChangePasswordDto";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(
    null
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (data: UpdateUserDto) => {
    if (!editingUser) return;
    await adminApi.updateUser(parseInt(editingUser.id), data);
    await loadUsers();
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await adminApi.deleteUser(id);
      await loadUsers();
    } catch (err: any) {
      alert(err?.message || "Failed to delete user.");
    }
  };

  const handleChangePassword = async (data: ChangePasswordDto) => {
    if (!changingPasswordUser) return;
    await adminApi.changeUserPassword(parseInt(changingPasswordUser.id), data);
    setChangingPasswordUser(null);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const openPasswordModal = (user: User) => {
    setChangingPasswordUser(user);
    setIsPasswordModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage users and system settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 
                       text-white rounded-xl font-semibold shadow-md"
          >
            👥 Users
          </button>
          <button
            onClick={() => navigate("/admin/travel-plans")}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold 
                       hover:bg-gray-50 border-2 border-gray-200"
          >
            ✈️ Travel Plans
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-6 py-5">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              User Management
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {users.length} {users.length === 1 ? "user" : "users"} registered
            </p>
          </div>

          <div className="p-6">
            <UserList
              users={users}
              onEdit={openEditModal}
              onDelete={handleDeleteUser}
              onChangePassword={openPasswordModal}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleUpdateUser}
        editingUser={editingUser}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setChangingPasswordUser(null);
        }}
        onSubmit={handleChangePassword}
        user={changingPasswordUser}
      />
    </div>
  );
};