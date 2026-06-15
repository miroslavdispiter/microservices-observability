import type { User } from "../../models/user/User";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onChangePassword: (user: User) => void;
  isLoading?: boolean;
}

export const UserList = ({
  users,
  onEdit,
  onDelete,
  onChangePassword,
  isLoading = false,
}: UserListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg
          className="animate-spin h-10 w-10 text-violet-500"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No users found
        </h3>
        <p className="text-gray-500">The system has no registered users yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-4 px-4 font-semibold text-gray-700">
              ID
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">
              Name
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">
              Username
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">
              Email
            </th>
            <th className="text-left py-4 px-4 font-semibold text-gray-700">
              Role
            </th>
            <th className="text-right py-4 px-4 font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4 text-gray-600">{user.id}</td>
              <td className="py-4 px-4">
                <div className="font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </div>
              </td>
              <td className="py-4 px-4 text-gray-600">{user.username}</td>
              <td className="py-4 px-4 text-gray-600">{user.email}</td>
              <td className="py-4 px-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "Admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 bg-violet-100 hover:bg-violet-200 text-violet-600 
                               rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onChangePassword(user)}
                    className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-600 
                               rounded-lg transition-colors"
                    title="Change Password"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete user "${user.username}"?`
                        )
                      ) {
                        onDelete(parseInt(user.id));
                      }
                    }}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 
                               rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};