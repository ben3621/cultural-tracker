import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-gray-950 p-4 text-white flex gap-6 border-b border-gray-800">
      <Link to="/" className="hover:underline">New Entry</Link>
      <Link to="/history" className="hover:underline">History</Link>
    </header>
  );
}
