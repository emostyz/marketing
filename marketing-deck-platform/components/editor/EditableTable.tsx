import React, { useState } from 'react';

export default function EditableTable({ data: initialData, onChange }: any) {
  const [data, setData] = useState(initialData);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);

  const keys = Object.keys(data[0] || {});

  const handleCellEdit = (row: number, col: string, value: string) => {
    const newData = data.map((r: any, i: number) =>
      i === row ? { ...r, [col]: value } : r
    );
    setData(newData);
    onChange && onChange(newData);
  };

  const handleAddRow = () => {
    const newRow: any = {};
    keys.forEach(k => (newRow[k] = ''));
    const newData = [...data, newRow];
    setData(newData);
    onChange && onChange(newData);
  };

  const handleRemoveRow = (idx: number) => {
    const newData = data.filter((_: any, i: number) => i !== idx);
    setData(newData);
    onChange && onChange(newData);
  };

  const handleAddCol = () => {
    const colName = prompt('Column name?');
    if (!colName) return;
    const newData = data.map((row: any) => ({ ...row, [colName]: '' }));
    setData(newData);
    onChange && onChange(newData);
  };

  const handleRemoveCol = (col: string) => {
    const newData = data.map((row: any) => {
      const { [col]: _, ...rest } = row;
      return rest;
    });
    setData(newData);
    onChange && onChange(newData);
  };

  return (
    <div className="bg-[#23242b] rounded-xl p-4 mb-4">
      <div className="flex gap-2 mb-2">
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleAddRow}>+ Add Row</button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleAddCol}>+ Add Column</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-blue-100 border-collapse">
          <thead>
            <tr>
              {keys.map(k => (
                <th key={k} className="border-b border-blue-700 p-1 text-left">
                  {k}
                  <button className="ml-2 text-xs text-red-400" onClick={() => handleRemoveCol(k)}>Remove</button>
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i}>
                {keys.map(k => (
                  <td key={k} className="border-b border-blue-900 p-1">
                    {editingCell?.row === i && editingCell.col === k ? (
                      <input
                        className="bg-[#181A20] text-white rounded p-1"
                        value={row[k]}
                        onChange={e => handleCellEdit(i, k, e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                      />
                    ) : (
                      <span onClick={() => setEditingCell({ row: i, col: k })}>{row[k]}</span>
                    )}
                  </td>
                ))}
                <td><button className="text-red-400 text-xs" onClick={() => handleRemoveRow(i)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 