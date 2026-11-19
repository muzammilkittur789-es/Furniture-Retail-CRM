import React from 'react';
import { formatINR } from '@/lib/utils';
import { Trophy, Award } from 'lucide-react';

export interface LeaderboardEntry {
  staffId: string;
  name: string;
  role: string;
  quoteCount: number;
  totalPipelineValue: number;
  totalClosedValue: number;
  conversionRate: number;
}

interface SalesmanLeaderboardProps {
  entries: LeaderboardEntry[];
}

function getAvatarColor(name: string) {
  if (name.includes('Arjun')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  if (name.includes('Sneha')) return 'bg-purple-100 text-purple-700 border-purple-200';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function SalesmanLeaderboard({ entries }: SalesmanLeaderboardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-900">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6 text-center w-20">Rank</th>
              <th className="py-4 px-6">Salesman</th>
              <th className="py-4 px-6 text-center">Quotes Sent</th>
              <th className="py-4 px-6 text-right">Pending Amount</th>
              <th className="py-4 px-6 text-right">Total Sold</th>
              <th className="py-4 px-6 text-right">Success Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-normal">
                  No quotes recorded for this period.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => {
                const rank = index + 1;
                const avatarClass = getAvatarColor(entry.name);
                const initials = getInitials(entry.name);

                return (
                  <tr
                    key={entry.staffId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-6 text-center">
                      {rank === 1 ? (
                        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs inline-flex items-center justify-center border border-amber-300 shadow-xs">
                          🥇
                        </span>
                      ) : rank === 2 ? (
                        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center justify-center border border-slate-200">
                          🥈
                        </span>
                      ) : rank === 3 ? (
                        <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 font-bold text-xs inline-flex items-center justify-center border border-amber-200">
                          🥉
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          #{rank}
                        </span>
                      )}
                    </td>

                    {/* Salesman Name & Avatar */}
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${avatarClass}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <span className="font-display font-semibold text-sm text-slate-900 block">
                            {entry.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            {entry.role === 'admin' ? 'Showroom Owner' : 'Sales Staff'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Quotes Sent */}
                    <td className="py-4 px-6 text-center font-mono font-semibold text-slate-700">
                      {entry.quoteCount}
                    </td>

                    {/* Pipeline Value */}
                    <td className="py-4 px-6 text-right font-display text-sm font-bold text-slate-900">
                      {formatINR(entry.totalPipelineValue)}
                    </td>

                    {/* Closed Revenue */}
                    <td className="py-4 px-6 text-right font-display text-sm font-extrabold text-emerald-600">
                      {formatINR(entry.totalClosedValue)}
                    </td>

                    {/* Win Rate */}
                    <td className="py-4 px-6 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-mono">
                        {entry.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
