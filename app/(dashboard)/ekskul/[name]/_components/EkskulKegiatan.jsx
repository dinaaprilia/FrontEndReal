"use client";

import { useEffect, useState } from "react";
import { FaBullhorn } from "react-icons/fa";

function formatDateToText(dateStr) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  const monthName = months[parseInt(month, 10) - 1];
  return `${day} ${monthName} ${year}`;
}

export default function KegiatanEksCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [kegiatanId, setKegiatanId] = useState(null);
  const [namaEkskul, setNamaEkskul] = useState("-");
  const [ekskulId, setEkskulId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const selected = localStorage.getItem("selectedEkskul");
      if (selected) {
        const parsed = JSON.parse(selected);
        setNamaEkskul(parsed.name || "-");
        setEkskulId(parsed.id || null);
      }
    }
  }, []);

  useEffect(() => {
    if (!ekskulId) return;
    fetch(`http://localhost:8000/api/ekskul/${ekskulId}/kegiatan`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTitle(data[0].title);
          setDate(data[0].date);
          setKegiatanId(data[0].id);
        } else {
          console.warn("⚠️ Tidak ada kegiatan ditemukan untuk ekskul ini.");
        }
      })
      .catch((err) => console.error("❌ Gagal fetch kegiatan:", err));
  }, [ekskulId]);

  const handleEditClick = async (e) => {
    e.stopPropagation();
    if (isEditing) {
      if (!title || !date) {
        alert("Judul dan tanggal tidak boleh kosong!");
        return;
      }

      try {
        if (kegiatanId) {
          await fetch(`http://localhost:8000/api/ekskul/${ekskulId}/kegiatan/${kegiatanId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, date })
          });
        } else {
          const res = await fetch(`http://localhost:8000/api/ekskul/${ekskulId}/kegiatan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, date })
          });
          const result = await res.json();
          setKegiatanId(result.data.id);
        }
        console.log("✅ Perubahan berhasil disimpan");
      } catch (err) {
        console.error("❌ Gagal simpan:", err);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = async () => {
    if (!kegiatanId) return;
    try {
      await fetch(`http://localhost:8000/api/kegiatan/${kegiatanId}`, {
        method: "DELETE",
      });
      setTitle("");
      setDate("");
      setKegiatanId(null);
    } catch (err) {
      console.error("❌ Gagal hapus:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-7xl h-[220px] max-sm:h-auto mt-1 flex max-sm:flex-col max-sm:gap-4 max-sm:items-center justify-between items-start cursor-default hover:opacity-90 relative">
      <div className="flex-1 flex flex-col justify-center max-sm:items-center max-sm:text-center">
        <div className="flex items-center gap-2 max-sm:flex-col max-sm:gap-1 max-sm:mb-2">
          <FaBullhorn className="text-black sm:text-2xl text-xl" />
          <h2 className="text-black font-semibold sm:text-2xl text-xl">{namaEkskul}</h2>
        </div>

        {isEditing ? (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[200px] text-black font-medium text-base mt-1 p-2 border rounded-lg shadow-sm"
          />
        ) : (
          <p className="text-black font-medium text-xl mt-1 max-sm:mt-2">
            {formatDateToText(date)}
          </p>
        )}

        <div className="flex justify-center items-center ml-28 mt-2 max-sm:ml-0">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-black sm:text-3xl text-2xl font-bold p-1 rounded"
            />
          ) : (
            <p className="sm:text-3xl text-2xl font-bold text-blue-950">{title || "-"}</p>
          )}
        </div>
      </div>

      <div className="w-32 h-28 mr-8 overflow-hidden flex-shrink-0 mt-10 max-sm:mt-0 max-sm:mr-0 max-sm:w-24 max-sm:h-24">
        <img
          src="/images/Ekskul.png"
          alt="logo"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute bottom-4 left-4 flex gap-2 max-sm:static max-sm:mt-4">
        <button
          onClick={handleEditClick}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
        >
          {isEditing ? "Simpan" : "Update Kegiatan"}
        </button>

        {kegiatanId && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}
