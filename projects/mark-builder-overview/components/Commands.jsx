export default function Commands({ d }) {
  return (
    <section className="mt-12">
      <h2 className="font-mono text-xs tracking-widest text-muted uppercase">{d.heading}</h2>
      <table className="mt-4 w-full text-left text-sm">
        <tbody>
          {d.items.map((item) => (
            <tr key={item.cmd} className="border-t border-line">
              <td className="py-3 pr-6 font-mono whitespace-nowrap text-accent">{item.cmd}</td>
              <td className="py-3 text-muted">{item.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
