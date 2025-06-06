import { useEffect } from "react";
import { FaBullhorn } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { id as localeID } from "date-fns/locale";

export default function TourCard() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("-");
  const today = new Date().toISOString().split('T')[0]; // format: yyyy-mm-dd
const [date, setDate] = useState(today);
 // format ISO yyyy-MM-dd

  const formattedDate = format(parseISO(date), 'EEEE, dd MMMM yyyy', { locale: localeID });

  useEffect(() => {
  // Fetch data awal saat component pertama kali dimount
  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/studytour-info");
      const data = await res.json();

      if (res.ok && data) {
        setTitle(data.title || ""); // isi default jika kosong
        setDate(data.tanggal || "2025-04-04");
      }
    } catch (err) {
      console.error("Gagal fetch data awal:", err);
    }
  };

  fetchData();
}, []);

  const handleClick = () => {
    if (!isEditing) {
      router.push("/studytourdetail");
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (isEditing) {
      handleSave(); // simpan ke backend
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    const hari = format(parseISO(date), 'EEEE', { locale: localeID });

    const payload = {
      kelas: "7A", // ganti sesuai kelas sebenarnya
      tanggal: date,
      hari: hari,
      mulai: "08:00", // default sementara
      selesai: "15:00",
      tujuan: "Museum Nasional",
      biaya: 50000,
      title: title,
    };

    try {
     const response = await fetch("http://localhost:8000/api/studytour-info", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});


      const result = await response.json();
      if (response.ok) {
        alert("Data berhasil disimpan!");
      } else {
        alert("Gagal menyimpan: " + result.message);
      }
    } catch (error) {
      console.error("Gagal simpan:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  return (
    <div
      className="bg-[#869ddd] p-6 rounded-2xl shadow-lg w-full max-w-7xl h-[220px] mt-5 flex justify-between items-start cursor-pointer hover:opacity-90 relative"
      onClick={handleClick}
    >
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <FaBullhorn className="text-white text-2xl" />
          <h2 className="text-white font-semibold text-2xl">Study Tour</h2>
        </div>

        {isEditing ? (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-black font-medium text-xl mt-1 p-1 rounded w-fit"
          />
        ) : (
          <p className="text-white font-medium text-xl mt-1">{formattedDate}</p>
        )}

        <div className="flex justify-center items-center ml-28 mt-2">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-black text-3xl font-bold p-1 rounded"
            />
          ) : (
            <p
              className="text-3xl font-bold text-blue-950"
              onClick={() => router.push("/studytourdetail")}
            >
              {title}
            </p>
          )}
        </div>
      </div>

      <div className="w-24 h-24 mr-8 overflow-hidden flex-shrink-0 mt-10">
        <img 
          src="/images/tour.png" 
          alt="Foto Petugas Piket" 
          className="w-full h-full object-cover"
        />
      </div>

      <button
        onClick={handleEditClick}
        className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg shadow absolute bottom-4 left-4"
      >
        {isEditing ? "Simpan" : "Update Perjalanan"}
      </button>
    </div>
  );
}
