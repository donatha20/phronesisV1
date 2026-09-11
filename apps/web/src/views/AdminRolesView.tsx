import React, { useState } from 'react';
import {
  Shield, Plus, Trash2, Loader2, Lock, Search, UserCog, X, CheckCircle2
} from 'lucide-react';
import { apiErrorMessage } from '../lib/api';
import {
  useRoles, useRoleMutations, useAdminUsers, useAssignUserRole, CreateRoleInput,
} from '../api/hooks';

const BASE_KIND_LABEL: Record<string, string> = {
  mentee: 'Mentee-like',
  mentor: 'Mentor-like',
  admin: 'Admin-like',
};

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const AdminRolesView: React.FC = () => {
  const rolesQuery = useRoles();
  const roleMutations = useRoleMutations();
  const roles = rolesQuery.data ?? [];

  const [userSearch, setUserSearch] = useState('');
  const usersQuery = useAdminUsers(userSearch);
  const assignRole = useAssignUserRole();
  const users = usersQuery.data ?? [];

  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBaseKind, setNewBaseKind] = useState<CreateRoleInput['baseKind']>('mentor');
  const [newDescription, setNewDescription] = useState('');

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await roleMutations.create.mutateAsync({
        name: newName.trim(),
        slug: slugify(newName),
        baseKind: newBaseKind,
        description: newDescription.trim(),
      });
      setIsCreateModalOpen(false);
      setNewName('');
      setNewDescription('');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const handleDeleteRole = async (id: string) => {
    setError(null);
    try {
      await roleMutations.remove.mutateAsync(id);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    setError(null);
    try {
      await assignRole.mutateAsync({ userId, roleId });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-1">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
          Administration
        </span>
        <h1 className="text-2xl font-bold font-serif-display text-stone-900">Roles &amp; User Management</h1>
        <p className="text-xs text-stone-600">
          Create roles beyond the three built-in ones and assign them to users. Every custom role
          still behaves like one of Mentee/Mentor/Admin internally (its "base kind") — that's what
          every permission check across the app uses — while carrying its own name for display.
        </p>
      </div>

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 whitespace-pre-line">
          {error}
        </div>
      )}

      {/* Roles */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-amber-600" /> Roles
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" /> New Role
          </button>
        </div>

        {rolesQuery.isLoading ? (
          <div className="text-xs text-stone-500 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading roles...</div>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between gap-3 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900 truncate">{role.name}</span>
                    <span className="text-[10px] font-mono text-stone-400 truncate">{role.slug}</span>
                    {role.is_system && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> System
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {BASE_KIND_LABEL[role.base_kind] ?? role.base_kind}
                    {role.description ? ` · ${role.description}` : ''}
                  </div>
                </div>
                {!role.is_system && (
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    disabled={roleMutations.remove.isPending}
                    title="Delete role"
                    className="p-2 rounded-xl bg-white border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 transition shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <UserCog className="w-4 h-4 text-amber-600" /> Users
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        {usersQuery.isLoading ? (
          <div className="text-xs text-stone-500 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading users...</div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 flex-wrap"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm text-stone-900 truncate">{user.display_name}</div>
                  <div className="text-[11px] text-stone-500 truncate">{user.email}</div>
                </div>
                <select
                  value={user.role.id}
                  onChange={(e) => handleAssignRole(user.id, e.target.value)}
                  disabled={assignRole.isPending}
                  className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-xs text-stone-500 text-center py-6">No users match your search.</p>
            )}
          </div>
        )}
      </div>

      {/* Create role modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-base font-bold text-stone-900">Create New Role</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Youth Pastor"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600"
                />
                {newName.trim() && (
                  <p className="text-[10px] text-stone-400">Slug: {slugify(newName)}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Behaves Like *</label>
                <select
                  value={newBaseKind}
                  onChange={(e) => setNewBaseKind(e.target.value as CreateRoleInput['baseKind'])}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                >
                  <option value="mentee">Mentee-like (read access, no elder tools)</option>
                  <option value="mentor">Mentor-like (can create resources, sessions, etc.)</option>
                  <option value="admin">Admin-like (full administrative access)</option>
                </select>
                <p className="text-[10px] text-stone-500">
                  Determines what this role can do across the app — every permission check keys off this,
                  not the role's name.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roleMutations.create.isPending}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1.5"
                >
                  {roleMutations.create.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignRole.isSuccess && !assignRole.isPending && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-stone-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Role updated.
        </div>
      )}
    </div>
  );
};
