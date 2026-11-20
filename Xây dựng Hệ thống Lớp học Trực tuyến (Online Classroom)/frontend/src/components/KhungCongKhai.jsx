import { Outlet, useLocation } from 'react-router-dom';
import { ThanhDauTrang } from './ThanhDauTrang';
import { ChanTrang } from './ChanTrang';

export function KhungCongKhai({ children }) {
  const { pathname } = useLocation();
  const laTrangChu = pathname === '/';

  return (
    <div className="d-flex flex-column min-vh-100">
      <ThanhDauTrang />
      {/* Trang chu bat dau tu y=0 cho hero, cac trang khac dem 78px de khong bi navbar che */}
      <main
        key={pathname}
        className={`flex-grow-1 vao-canh-cong-khai ${laTrangChu ? 'trang-chu-chinh' : 'trang-cong-khai-co-dem'}`}
        style={!laTrangChu ? { paddingTop: '78px' } : undefined}
      >
        {children || <Outlet />}
      </main>
      <ChanTrang dienAnh />
    </div>
  );
}
