import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}