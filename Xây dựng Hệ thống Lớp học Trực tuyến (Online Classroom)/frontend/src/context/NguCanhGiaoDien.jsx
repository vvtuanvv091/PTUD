import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const NguCanhGiaoDien = createContext(null);
const KHOA_LUU_GIAO_DIEN = 'educlass_che_do_giao_dien';

export function NhaCungCapGiaoDien({ children }) {
  const [cheDo, datCheDo] = useState(() => {
    const daLuu = localStorage.getItem(KHOA_LUU_GIAO_DIEN);
    if (daLuu === 'dark' || daLuu === 'light') return daLuu;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', cheDo);
    if (document.body) {
      document.body.setAttribute('data-bs-theme', cheDo);
    }
    localStorage.setItem(KHOA_LUU_GIAO_DIEN, cheDo);
  }, [cheDo]);

  const chuyenCheDoGiaoDien = () => {
    datCheDo((truoc) => (truoc === 'dark' ? 'light' : 'dark'));
  };

  const giaTri = useMemo(
    () => ({
      cheDo,
      cheDoToi: cheDo === 'dark',
      datCheDo,
      chuyenCheDoGiaoDien,
    }),
    [cheDo]
  );

  return <NguCanhGiaoDien.Provider value={giaTri}>{children}</NguCanhGiaoDien.Provider>;
}

export const suDungGiaoDien = () => {
  const ctx = useContext(NguCanhGiaoDien);
  if (!ctx) throw new Error('suDungGiaoDien phải được gọi bên trong NhaCungCapGiaoDien');
  return ctx;
};
