'use client';

import React, { useState, useTransition } from 'react';
import { StaffMember } from '@/lib/store/showroom-store';
import {
  createStaffAction,
  updateStaffPinAction,
  toggleStaffStatusAction,
  deleteStaffAction,
} from '@/app/(admin)/admin/actions';
import {
  UserPlus,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Save,
  X,
  Lock,
  User,
  AlertCircle,
  AlertTriangle,
  UserX,
} from 'lucide-react';

interface StaffCredentialsClientProps {
  initialStaff: StaffMember[];
}

export function StaffCredentialsClient({ initialStaff }: StaffCredentialsClientProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [showPins, setShowPins] = useState<{ [id: string]: boolean }>({});
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [newPinValue, setNewPinValue] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deactivateConfirmStaff, setDeactivateConfirmStaff] = useState<StaffMember | null>(null);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const togglePinVisibility = (id: string) => {
    setShowPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartEditPin = (staff: StaffMember) => {
    setEditingPinId(staff.id);
    setNewPinValue(staff.pin);
    setErrorMessage(null);
  };

  const handleSavePin = (id: string) => {
    if (!newPinValue || newPinValue.length !== 4 || !/^\d{4}$/.test(newPinValue)) {
      setErrorMessage('PIN must be exactly 4 numbers (digits).');
      return;
    }

    startTransition(async () => {
      const res = await updateStaffPinAction(id, newPinValue);
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, pin: newPinValue } : s))
        );
        setEditingPinId(null);
        setSuccessMessage('PIN updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to update PIN.');
      }
    });
  };

  const handleInitiateToggleStatus = (staff: StaffMember) => {
    if (staff.is_active) {
      // Ask again to confirm before deactivating
      setDeactivateConfirmStaff(staff);
    } else {
      // Reactivate directly
      handleToggleStatus(staff.id, false);
    }
  };

  const handleConfirmDeactivate = () => {
    if (!deactivateConfirmStaff) return;
    const target = deactivateConfirmStaff;
    setDeactivateConfirmStaff(null);
    handleToggleStatus(target.id, true);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    startTransition(async () => {
      const res = await toggleStaffStatusAction(id, nextStatus);
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_active: nextStatus } : s))
        );
        setSuccessMessage(
          nextStatus ? 'Staff member activated.' : 'Staff member deactivated.'
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to update status.');
      }
    });
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;

    startTransition(async () => {
      const res = await deleteStaffAction(id);
      if (res.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== id));
        setSuccessMessage(`${name} removed.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to remove staff.');
      }
    });
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newName.trim()) {
      setErrorMessage('Please enter staff name.');
      return;
    }

    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setErrorMessage('PIN must be 4 digits.');
      return;
    }

    startTransition(async () => {
      const res = await createStaffAction(newName, newPin, 'sales');
      if (res.success && res.staff) {
        setStaffList((prev) => [...prev, res.staff!]);
        setIsAddModalOpen(false);
        setNewName('');
        setNewPin('');
        setSuccessMessage('New sales person added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to add staff member.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-bold block mb-1">
            Alishan Furnitures • Security
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Sales Staff &amp; PIN Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Manage who can log into the showroom tablet to make quotes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(true);
            setErrorMessage(null);
          }}
          className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition"
        >
          <span>+ Add Sales Person</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Staff Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {staffList.map((staff) => {
          const isOwner = staff.role === 'admin';
          const isPinVisible = showPins[staff.id];
          const isEditingPin = editingPinId === staff.id;

          return (
            <div
              key={staff.id}
              className={`bg-white rounded-3xl border transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between shadow-xs ${
                staff.is_active
                  ? 'border-slate-200/90 hover:border-indigo-300'
                  : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                {/* Top Role & Status Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                      isOwner
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isOwner ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    {isOwner ? 'Showroom Owner' : 'Sales Person'}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      staff.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        staff.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    {staff.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                {/* Staff Name */}
                <h3 className="text-lg font-display font-bold text-slate-900 leading-snug">
                  {staff.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: #{staff.id.slice(-6)}
                </p>

                {/* PIN Control Box */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      Login PIN
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePinVisibility(staff.id)}
                      className="text-slate-400 hover:text-indigo-600 transition"
                      title={isPinVisible ? 'Hide PIN' : 'View PIN'}
                    >
                      {isPinVisible ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {isEditingPin ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={newPinValue}
                        onChange={(e) => setNewPinValue(e.target.value.replace(/\D/g, ''))}
                        className="w-24 px-3 py-1.5 rounded-xl border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center text-base font-bold text-slate-900"
                        placeholder="4 digits"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSavePin(staff.id)}
                        className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                        title="Save PIN"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPinId(null)}
                        className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">
                        {isPinVisible ? staff.pin : '••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEditPin(staff)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Change PIN</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={isPending || isOwner}
                  onClick={() => handleInitiateToggleStatus(staff)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                    isOwner
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                      : staff.is_active
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={isOwner ? 'Owner cannot be disabled' : undefined}
                >
                  {isOwner
                    ? 'Owner Always Active'
                    : staff.is_active
                    ? 'Deactivate Staff'
                    : 'Activate Staff'}
                </button>

                {!isOwner && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDeleteStaff(staff.id, staff.name)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Remove Staff Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-900">
                  Add New Sales Person
                </h3>
                <p className="text-xs text-slate-500">
                  Set their showroom name and 4-digit PIN.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Staff Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  4-Digit Login PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 3344"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center text-lg font-bold text-slate-900 tracking-widest placeholder:text-slate-300"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The staff person will use this 4-digit number to unlock the tablet.
                </p>
              </div>

              <div className="pt-3 flex gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 px-3.5 sm:px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition whitespace-nowrap text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 px-3.5 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold sm:font-bold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-indigo-600/20 active:scale-95 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Save Staff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 2: CONFIRM STAFF DEACTIVATION */}
      {deactivateConfirmStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 stroke-[2]" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-slate-900 mb-2">
              Confirm Staff Deactivation
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Are you sure you want to deactivate{' '}
              <strong className="text-slate-900 font-bold">
                &ldquo;{deactivateConfirmStaff.name}&rdquo;
              </strong>
              ? They will be locked out and cannot log in to make quotes on the showroom floor until reactivated.
            </p>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeactivateConfirmStaff(null)}
                className="flex-1 py-2.5 px-3.5 sm:px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition whitespace-nowrap text-center"
              >
                No, Keep Active
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDeactivate}
                className="flex-1 py-2.5 px-3.5 sm:px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold sm:font-bold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-amber-600/20 active:scale-95 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <UserX className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Yes, Deactivate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
