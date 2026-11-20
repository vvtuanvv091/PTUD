import axios from 'axios';

export const DUONG_DAN_API = import.meta.env.VITE_API_URL || '/api';
export const DUONG_DAN_TAI_LEN = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:5000';

const goiApi = axios.create({
  baseURL: DUONG_DAN_API,
  timeout: 20000,
});

goiApi.interceptors.request.use(
  (cauHinh) => {
    const token = localStorage.getItem('educlass_token');
    if (token) {
      cauHinh.headers.Authorization = `Bearer ${token}`;
    }
    return cauHinh;
  },
  (loi) => Promise.reject(loi)
);

goiApi.interceptors.response.use(
  (phanHoi) => phanHoi,
  (loi) => {
    const maTrangThai = loi.response?.status;
    const thongDiep = loi.response?.data?.message || '';

    if (maTrangThai === 401 || (maTrangThai === 403 && thongDiep.includes('khóa'))) {
      const duongDanHienTai = window.location.pathname;
      if (!['/login', '/register'].includes(duongDanHienTai)) {
        localStorage.removeItem('educlass_token');
        localStorage.removeItem('educlass_user');
        window.dispatchEvent(new CustomEvent('educlass:het-phien', { detail: thongDiep }));
      }
    }

    return Promise.reject(loi);
  }
);

export const layThongBaoLoi = (loi, macDinh = 'Đã xảy ra lỗi, vui lòng thử lại') => {
  if (loi?.code === 'ERR_NETWORK' || !loi?.response) {
    return 'Không kết nối được tới máy chủ API (cổng 5000). Vui lòng kiểm tra Backend đã chạy (npm run dev:backend).';
  }
  return loi?.response?.data?.message || loi?.message || macDinh;
};

export const taoDuongDanTep = (duongDanTuongDoi) => {
  if (!duongDanTuongDoi) return '';
  if (
    duongDanTuongDoi.startsWith('http://') ||
    duongDanTuongDoi.startsWith('https://') ||
    duongDanTuongDoi.startsWith('blob:') ||
    duongDanTuongDoi.startsWith('/images/') ||
    duongDanTuongDoi.startsWith('/assets/') ||
    duongDanTuongDoi.startsWith('/uploads/')
  ) {
    return duongDanTuongDoi;
  }
  return `${DUONG_DAN_TAI_LEN}${duongDanTuongDoi.startsWith('/') ? '' : '/'}${duongDanTuongDoi}`;
};

export default goiApi;
