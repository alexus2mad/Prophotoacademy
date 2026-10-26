import clients from '@/lib/photography/home-clients.json';
export function AcademyClients() {
  return (
    <section className="academy-design-clients" aria-labelledby="academy-clients-title">
      <h2 id="academy-clients-title">Знімали та навчали для</h2>
      <ul>
        {clients.map((client) => (
          <li key={client.id} data-client={client.id}>
            <img
              src={(process.env.NEXT_PUBLIC_BASE_PATH || '') + client.src}
              alt={client.name}
              width="140"
              height="64"
              loading="lazy"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
