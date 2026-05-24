// jenisTeh.js
const menuAwal = [
  { id: 1, namaItem: "Original Tea", harga: 3000, stokAwal: 50, satuan: "cup" },
  { id: 2, namaItem: "Milk Tea", harga: 5000, stokAwal: 50, satuan: "cup" },
  { id: 3, namaItem: "Milo", harga: 7000, stokAwal: 50, satuan: "cup" },
  { id: 4, namaItem: "Thai Tea", harga: 8000, stokAwal: 50, satuan: "cup" },
  { id: 5, namaItem: "Matcha", harga: 8000, stokAwal: 50, satuan: "cup" }, // Ditambahkan untuk varian susu
  { id: 6, namaItem: "Milk", harga: 5000, stokAwal: 50, satuan: "cup" },   // Menu susu murni
  { id: 7, namaItem: "Cappuccino", harga: 6000, stokAwal: 50, satuan: "cup" },
  { id: 8, namaItem: "Chocolate", harga: 6000, stokAwal: 50, satuan: "cup" }
];

// Ambil dari localStorage jika sudah ada, jika belum gunakan menuAwal
const getLocalJenisTeh = () => {
  const localData = localStorage.getItem("jenisTehData");
  if (localData) {
    return JSON.parse(localData);
  }
  localStorage.setItem("jenisTehData", JSON.stringify(menuAwal));
  return menuAwal;
};

const jenisTeh = getLocalJenisTeh();
export default jenisTeh;