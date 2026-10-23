import React from 'react';
import { ChangeLogEntry } from '../../types/organizer';

interface ChangeLogViewProps {
  log: ChangeLogEntry[];
  onRollback: (logIndex: number) => void;
}

export const ChangeLogView: React.FC<ChangeLogViewProps> = ({ log, onRollback }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rule Change Log</h1>
          <p className="text-sm text-gray-600">
            Immutable audit record of all live rule shifts, court pivots, and organizer approvals.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm overflow-x-auto">
        {log.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No rule modifications recorded yet. Use Copilot to apply a mid-tournament rule pivot and approve it to see an entry.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs font-bold text-gray-500 uppercase">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Actor</th>
                <th className="pb-3">Tool Call</th>
                <th className="pb-3">Matches</th>
                <th className="pb-3">Rule Before</th>
                <th className="pb-3">Rule After</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 font-mono text-xs text-gray-600">{entry.time}</td>
                  <td className="py-3 font-bold text-gray-800">{entry.actor}</td>
                  <td className="py-3">
                    <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-[#0A5C43]">
                      {entry.tool}
                    </code>
                  </td>
                  <td className="py-3 font-semibold text-gray-700">{entry.matchCount}</td>
                  <td className="py-3 text-gray-500">{entry.before}</td>
                  <td className="py-3 font-bold text-[#0A5C43]">{entry.after}</td>
                  <td className="py-3 text-right">
                    {entry.isRolledBack ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                        Rolled Back
                      </span>
                    ) : (
                      <button
                        onClick={() => onRollback(idx)}
                        className="px-3 py-1 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        Roll Back
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
