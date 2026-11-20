import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const NguCanhThongBao = createContext(null);

export function NhaCungCapThongBao({ children }) {
  const [dsThongBao, datDsThongBao] = useState([]);

  const xoaThongBao = useCallback((id) => {
    datDsThongBao((truoc) => truoc.filter((item) => item.id !== id));
  }, []);

  const themThongBao = useCallback(
    (noiDung, loai = 'info', thoiLuong = 3800) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      datDsThongBao((truoc) => [...truoc.slice(-3), { id, noiDung, loai }]);
      if (thoiLuong > 0) {
        setTimeout(() => xoaThongBao(id), thoiLuong);
      }
    },
    [xoaThongBao]
  );

  const giaTri = useMemo(
    () => ({
      thanhCong: (nd) => themThongBao(nd, 'success'),
      loi: (nd) => themThongBao(nd, 'error', 5200),
      thongTin: (nd) => themThongBao(nd, 'info'),
    }),
    [themThongBao]
  );

  return (
    <NguCanhThongBao.Provider value={giaTri}>
      {children}
      <div className="chong-thong-bao-noi" role="status" aria-live="polite">
        {dsThongBao.map((tb) => (
          <div key={tb.id} className="the-thong-bao-noi">
            <span className="flex-shrink-0 mt-1">
              {tb.loai === 'success' && <CheckCircle2 size={18} className="text-success" />}
              {tb.loai === 'error' && <AlertCircle size={18} className="text-danger" />}
              {tb.loai === 'info' && <Info size={18} className="text-primary" />}
            </span>
            <div className="flex-grow-1">{tb.noiDung}</div>
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-secondary"
              onClick={() => xoaThongBao(tb.id)}
              aria-label="Đóng thông báo"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </NguCanhThongBao.Provider>
  );
}

export const suDungThongBao = () => {
  const ctx = useContext(NguCanhThongBao);
  if (!ctx) throw new Error('suDungThongBao phải được gọi bên trong NhaCungCapThongBao');
  return ctx;
};

