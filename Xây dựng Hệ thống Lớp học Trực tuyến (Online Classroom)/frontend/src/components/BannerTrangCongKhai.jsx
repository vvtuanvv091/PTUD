import { Link } from 'react-router-dom';

export function BannerTrangCongKhai({ nhan, dongPhu, tieuDe, moTa, children }) {
  return (
    <div
      className="py-5 border-bottom"
      style={{
        background: 'var(--otsp-surface-subtle)',
      }}
    >
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0 small">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none text-muted">Trang chủ</Link>
            </li>
            <li className="breadcrumb-item active text-danger fw-semibold" aria-current="page">
              {nhan}
            </li>
          </ol>
        </nav>

        <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', color: 'var(--otsp-text-main)' }}>
          {tieuDe}
        </h1>

        {moTa && (
          <p className="text-muted mb-0" style={{ maxWidth: 680, fontSize: '1rem', lineHeight: 1.6 }}>
            {moTa}
          </p>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
