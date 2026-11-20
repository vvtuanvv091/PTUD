import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import goiApi from '../services/goiApi';
import { suDungThongBao } from './NguCanhThongBao';

const NguCanhXacThuc = createContext(null);

export function NhaCungCapXacThuc({ children }) {
  const thongBao = suDungThongBao();
  const [nguoiDung, datNguoiDung] = useState(() => {
    try {
      const luu = localStorage.getItem('educlass_user');
      return luu ? JSON.parse(luu) : null;
    } catch {
      return null;
    }
  });
  const [dangTai, datDangTai] = useState(() => Boolean(localStorage.getItem('educlass_token')));

  const luuPhien = useCallback((token, thongTinNguoiDung) => {
    localStorage.setItem('educlass_token', token);
    localStorage.setItem('educlass_user', JSON.stringify(thongTinNguoiDung));
    datNguoiDung(thongTinNguoiDung);
  }, []);

  const dangXuat = useCallback(() => {
    localStorage.removeItem('educlass_token');
    localStorage.removeItem('educlass_user');
    datNguoiDung(null);
  }, []);

  const taiLaiHoSo = useCallback(async () => {
    const token = localStorage.getItem('educlass_token');
    if (!token) {
      datDangTai(false);
      return null;
    }
    try {
      const phanHoi = await goiApi.get('/auth/me');
      const duLieu = phanHoi.data.data;
      localStorage.setItem('educlass_user', JSON.stringify(duLieu));
      datNguoiDung(duLieu);
      return duLieu;
    } catch {
      dangXuat();
      return null;
    } finally {
      datDangTai(false);
    }
  }, [dangXuat]);

  useEffect(() => {
    taiLaiHoSo();
  }, [taiLaiHoSo]);

  useEffect(() => {
    const xuLyHetPhien = (suKien) => {
      datNguoiDung(null);
      if (suKien.detail) {
        thongBao.loi(suKien.detail);
      }
    };
    window.addEventListener('educlass:het-phien', xuLyHetPhien);
    return () => window.removeEventListener('educlass:het-phien', xuLyHetPhien);
  }, [thongBao]);

  const dangNhap = useCallback(
    async (email, password) => {
      const phanHoi = await goiApi.post('/auth/login', { email, password });
      const { token, user } = phanHoi.data.data;
      luuPhien(token, user);
      return user;
    },
    [luuPhien]
  );

  const dangKy = useCallback(
    async (duLieuDangKy) => {
      const phanHoi = await goiApi.post('/auth/register', duLieuDangKy);
      const { token, user } = phanHoi.data.data;
      luuPhien(token, user);
      return user;
    },
    [luuPhien]
  );

  const giaTri = useMemo(
    () => ({
      nguoiDung,
      daDangNhap: Boolean(nguoiDung),
      dangTai,
      laQuanTri: nguoiDung?.role === 'admin',
      laGiangVien: nguoiDung?.role === 'teacher',
      laSinhVien: nguoiDung?.role === 'student',
      dangNhap,
      dangKy,
      dangXuat,
      taiLaiHoSo,
      capNhatNguoiDungCucBo: (duLieu) => {
        localStorage.setItem('educlass_user', JSON.stringify(duLieu));
        datNguoiDung(duLieu);
      },
    }),
    [nguoiDung, dangTai, dangNhap, dangKy, dangXuat, taiLaiHoSo]
  );

  return <NguCanhXacThuc.Provider value={giaTri}>{children}</NguCanhXacThuc.Provider>;
}

export const suDungXacThuc = () => {
  const ctx = useContext(NguCanhXacThuc);
  if (!ctx) throw new Error('suDungXacThuc phải được gọi bên trong NhaCungCapXacThuc');
  return ctx;
};

