import { taoDuongDanTep } from '../services/goiApi';

export const ANH_BIA_MAC_DINH = [
  { ten: 'MERN Stack', duongDan: '/images/bia-web-mern.jpg' },
  { ten: 'React & UI', duongDan: '/images/bia-react-ui.jpg' },
  { ten: 'MongoDB NoSQL', duongDan: '/images/bia-mongodb.jpg' },
  { ten: 'Bảo mật Web', duongDan: '/images/bia-security.jpg' },
  { ten: 'Khoa học dữ liệu', duongDan: '/images/bia-data-science.jpg' },
  { ten: 'Kiến trúc phần mềm', duongDan: '/images/bia-software-eng.jpg' },
];

export function AnhBiaKhoaHoc({
  anhBia,
  mauNen = '#DB303A',
  moTaAnh = 'Ảnh bìa khóa học',
  lopBoSung = '',
  children,
}) {
  const duongDanAnh = taoDuongDanTep(anhBia);

  return (
    <div
      className={`anh-bia-khoa-hoc ${duongDanAnh ? 'co-hinh-nen' : ''} ${lopBoSung}`}
      style={{ backgroundColor: mauNen || '#DB303A' }}
    >
      {duongDanAnh && (
        <>
          <img src={duongDanAnh} alt={moTaAnh} className="hinh-nen-bia-lop" loading="lazy" />
          <div className="lop-phu-bia-lop" aria-hidden="true" />
        </>
      )}
      <div className="noi-dung-bia-lop">{children}</div>
    </div>
  );
}
