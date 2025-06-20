import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SketchPicker } from 'react-color';

const defaultColors = ['#2563eb', '#8b5cf6', '#f59e42', '#10b981', '#ef4444', '#fbbf24'];

export default function EditableChart({ data: initialData, type: initialType = 'bar', onChange }: any) {
  const [data, setData] = useState(initialData);
  const [type, setType] = useState(initialType);
  const [colors, setColors] = useState(defaultColors.slice(0, Object.keys(initialData[0] || {}).length - 1));
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);

  const keys = Object.keys(data[0] || {});
  const categoryKey = keys[0];
  const valueKeys = keys.slice(1);

  const handleCellEdit = (row: number, col: string, value: string) => {
    const newData = data.map((r: any, i: number) =>
      i === row ? { ...r, [col]: isNaN(Number(value)) ? value : Number(value) } : r
    );
    setData(newData);
    onChange && onChange(newData, type, colors);
  };

  const handleAddRow = () => {
    const newRow: any = { [categoryKey]: '' };
    valueKeys.forEach(k => (newRow[k] = 0));
    const newData = [...data, newRow];
    setData(newData);
    onChange && onChange(newData, type, colors);
  };

  const handleRemoveRow = (idx: number) => {
    const newData = data.filter((_: any, i: number) => i !== idx);
    setData(newData);
    onChange && onChange(newData, type, colors);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
    onChange && onChange(data, e.target.value, colors);
  };

  const handleColorChange = (color: any, idx: number) => {
    const newColors = [...colors];
    newColors[idx] = color.hex;
    setColors(newColors);
    onChange && onChange(data, type, newColors);
  };

  return (
    <div className="bg-[#23242b] rounded-xl p-4 mb-4">
      <div className="flex gap-4 mb-2 items-center">
        <label className="text-blue-200">Chart Type:</label>
        <select value={type} onChange={handleTypeChange} className="rounded p-1 bg-[#181A20] text-white">
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
        </select>
        <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded" onClick={handleAddRow}>+ Add Row</button>
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-blue-100 border-collapse">
          <thead>
            <tr>
              <th className="border-b border-blue-700 p-1 text-left">{categoryKey}</th>
              {valueKeys.map((k, i) => (
                <th key={k} className="border-b border-blue-700 p-1 text-left">
                  {k}
                  <span className="ml-2 cursor-pointer" onClick={() => setShowColorPicker(i)}>
                    <span style={{ background: colors[i], display: 'inline-block', width: 16, height: 16, borderRadius: 4, border: '1px solid #fff' }} />
                  </span>
                  {showColorPicker === i && (
                    <div className="absolute z-50" style={{ position: 'absolute' }}>
                      <SketchPicker color={colors[i]} onChange={c => handleColorChange(c, i)} />
                      <button className="mt-2 text-xs text-blue-400" onClick={() => setShowColorPicker(null)}>Close</button>
                    </div>
                  )}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i}>
                <td className="border-b border-blue-900 p-1">
                  {editingCell?.row === i && editingCell.col === categoryKey ? (
                    <input
                      className="bg-[#181A20] text-white rounded p-1"
                      value={row[categoryKey]}
                      onChange={e => handleCellEdit(i, categoryKey, e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                    />
                  ) : (
                    <span onClick={() => setEditingCell({ row: i, col: categoryKey })}>{row[categoryKey]}</span>
                  )}
                </td>
                {valueKeys.map((k, j) => (
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
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey={categoryKey} stroke="#8b5cf6" />
              <YAxis stroke="#8b5cf6" />
              <Tooltip />
              <Legend />
              {valueKeys.map((k, i) => (
                <Bar key={k} dataKey={k} fill={colors[i]} />
              ))}
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey={categoryKey} stroke="#8b5cf6" />
              <YAxis stroke="#8b5cf6" />
              <Tooltip />
              <Legend />
              {valueKeys.map((k, i) => (
                <Line key={k} type="monotone" dataKey={k} stroke={colors[i]} strokeWidth={3} dot={{ r: 4 }} />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey={valueKeys[0]} nameKey={categoryKey} cx="50%" cy="50%" outerRadius={80} fill={colors[0]} label>
                {data.map((entry: any, i: number) => (
                  <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
} 