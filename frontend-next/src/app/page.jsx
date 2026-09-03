export default function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>MockMind</h1>
      <p>Cargando...</p>
      <script>
        {`
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            window.location.href = token ? '/historial' : '/login';
          }
        `}
      </script>
    </div>
  );
}
