import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function DataTable({
  columns,
  data,
  pagination,
  handleSort,
  renderSortIcon,
}) {
  return (
    <table className="table projects-table w-full text-sm backdrop-blur-md">
      <thead className="bg-white/40 backdrop-blur-lg border-b border-white/30">
        <tr>
          <th className="px-4 py-3 text-center font-semibold text-gray-700">
            #
          </th>

          {columns.map((col) => (
            <th
              key={col.field}
              onClick={() => col.sortable && handleSort(col.field)}
              className={`px-4 py-3 text-center font-semibold text-gray-700 ${
                col.sortable ? "cursor-pointer hover:text-indigo-600" : ""
              }`}
            >
              {col.label} {col.sortable && renderSortIcon(col.field)}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, index) => (
          <tr
            key={row.id}
            className="hover:bg-white/40 transition backdrop-blur-sm"
          >
            <td>{(pagination.current_page - 1) * 10 + index + 1}</td>

            {columns.map((col) => (
              <td key={col.field}>
                {col.render ? col.render(row) : row[col.field] || "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
