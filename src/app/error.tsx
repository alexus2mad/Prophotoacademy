'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="container status-panel"><h1>Не вдалося завантажити сторінку</h1><p>Спробуйте ще раз або зв’яжіться з академією.</p><button className="button" onClick={reset}>Спробувати ще раз</button><a href="mailto:academyprophoto@gmail.com" className="text-link">Написати академії</a></div>;}
