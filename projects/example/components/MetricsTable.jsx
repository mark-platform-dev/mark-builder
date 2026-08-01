export default function MetricsTable({ metrics, roadmap }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900">
        Summary of {roadmap.length} initiatives
      </h2>
      <table className="mt-4 w-full text-left text-sm">
        <tbody>
          {metrics.map((m) => (
            <tr key={m.label} className="border-t border-slate-200">
              <th className="py-2 font-normal text-slate-600">{m.label}</th>
              <td className="py-2 text-right font-medium text-slate-900">{m.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
