const chuanHoaOCsv = (giaTri) => {
  if (giaTri === null || giaTri === undefined) return '';
  const chuoi = String(giaTri);
  if (/[",\n\r]/.test(chuoi)) {
    return `"${chuoi.replace(/"/g, '""')}"`;
  }
  return chuoi;
};

// Them UTF-8 BOM (\uFEFF) de Excel tren Windows mo file tieng Viet khong bi loi font
const taoBufferCsv = (tieuDeCot, danhSachDong) => {
  const cacDong = [
    tieuDeCot.map(chuanHoaOCsv).join(','),
    ...danhSachDong.map((dong) => dong.map(chuanHoaOCsv).join(',')),
  ];
  return Buffer.from(`\uFEFF${cacDong.join('\r\n')}`, 'utf8');
};

module.exports = { taoBufferCsv };
