import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="text-center px-3" style={{ maxWidth: 480 }}>
          <h1 className="display-1 fw-bold text-muted mb-0">404</h1>
          <p className="lead text-secondary mb-4">This page doesn't exist.</p>
          <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
