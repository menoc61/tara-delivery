"use client";

import { useEffect, useState } from "react";
import {
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { adminApi } from "@/lib/api-client";
import { UserRole } from "@tara/types";

type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  _count?: { orders: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "CUSTOMER" | "RIDER">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [search, filter, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        page,
        limit: 20,
        role: filter !== "all" ? filter : undefined,
        search: search || undefined,
      });
      setUsers(res.data.data.items || []);
      setTotalPages(res.data.data.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.updateUser(userId, { isActive: !currentStatus });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "CUSTOMER", "RIDER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {f === "all" ? "Tous" : f === "CUSTOMER" ? "Clients" : "Livreurs"}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-container">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Utilisateur
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Contact
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Rôle
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Commandes
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Statut
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <div className="spinner mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-on-surface-variant"
                >
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-outline-variant/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">
                          {user.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-on-surface-variant">
                      {user.phone || "-"}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "RIDER"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role === "ADMIN"
                        ? "Admin"
                        : user.role === "RIDER"
                          ? "Livreur"
                          : "Client"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">
                    {user._count?.orders || 0}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`text-sm font-medium ${user.isActive ? "text-green-600" : "text-gray-400"}`}
                    >
                      {user.isActive ? (
                        <span className="flex items-center gap-1">
                          <ToggleRight className="w-5 h-5" /> Actif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ToggleLeft className="w-5 h-5" /> Inactif
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="p-2 rounded hover:bg-surface-container">
                        <Edit className="w-4 h-4 text-on-surface-variant" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary py-2 px-4 disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-on-surface-variant">
            Page {page} sur {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary py-2 px-4 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
