export default function Commands({ d }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900">{d.heading}</h2>
      <table className="mt-4 w-full text-left text-sm">
        <tbody>
          {d.items.map((item) => (
            <tr key={item.cmd} className="border-t border-slate-200">
              <td className="py-3 pr-6 font-mono text-slate-800 whitespace-nowrap">{item.cmd}</td>
              <td className="py-3 text-slate-600">{item.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
