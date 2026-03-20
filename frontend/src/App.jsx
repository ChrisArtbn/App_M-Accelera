import { Home, FileText, Users, MessageCircle, Heart, ArrowLeft, Search, Send, Upload, Download } from "lucide-react";
import { useState, useEffect } from "react";
// 🔥 FIREBASE CLEAN
import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

// ===================== ROOT APP =====================
export default function App() {
  const [page, setPage] = useState("home");
  const nav = (p) => setPage(p);

  if (page === "chat")   return <ChatPage onNavigate={nav} />;
  if (page === "pasien") return <PatientPage onNavigate={nav} />;
  if (page === "resume") return <ResumePage onNavigate={nav} />;
  if (page === "rekam")  return <RekamPage onNavigate={nav} />;
  return <HomePage onNavigate={nav} />;
}

// ===================== SHARED BOTTOM NAV =====================
function BottomNav({ active, onNavigate }) {
  return (
    <div className="bg-[#5E78B5]/95 backdrop-blur-xl rounded-t-3xl py-3 px-3 mt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      <div className="flex justify-between text-white text-xs text-center">
        <NavItem icon={<Home size={20} />}          label="Home"   active={active === "home"}   onClick={() => onNavigate("home")} />
        <NavItem icon={<FileText size={20} />}      label="Resume" active={active === "resume"} onClick={() => onNavigate("resume")} />
        <NavItem icon={<Users size={20} />}         label="Pasien" active={active === "pasien"} onClick={() => onNavigate("pasien")} />
        <NavItem icon={<MessageCircle size={20} />} label="Chat"   active={active === "chat"}   onClick={() => onNavigate("chat")} />
        <NavItem icon={<Heart size={20} />}         label="Rekam"  active={active === "rekam"}  onClick={() => onNavigate("rekam")} />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition cursor-pointer ${active ? "text-white scale-110" : "opacity-70"}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

// ===================== HOME PAGE =====================
function HomePage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8FAADC] to-[#6E8ED6] flex justify-center">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between">

        {/* HEADER */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 pl-2">
            <img src="/Logo_App.png" className="w-200 h-200 drop-shadow-lg" />
          </div>

          {/* SEARCH */}
          <div className="mt-3 bg-[#5E78B5]/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-white text-lg">🔍</span>
            <input
              placeholder="Search for information..."
              className="bg-transparent outline-none text-white placeholder-white w-full"
            />
          </div>
        </div>

        {/* HERO */}
        <div className="px-4 mt-3 flex items-center gap-2">
          <img src="/Dokter.png" className="w-48 drop-shadow-2xl" />
       <h2 className="font-bold text-blue-800 leading-tight font-cinzel">
  <span className="text-2xl">Welcome to</span> <br />
  <span className="text-2xl">Mayapada Hospital</span>
</h2>
        </div>

        {/* MENU GRID */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
          <Card title="Data Pasien"  icon="👤" onClick={() => onNavigate("pasien")} />
          <Card title="Resume Medis" icon="📄" onClick={() => onNavigate("resume")} />
          <Card title="Chat Pasien"  icon="💬" onClick={() => onNavigate("chat")} />
          <Card title="Rekam Medis"  icon="❤️" onClick={() => onNavigate("rekam")} />
        </div>

        {/* BOTTOM NAV */}
        <BottomNav active="home" onNavigate={onNavigate} />

      </div>
    </div>
  );
}

function Card({ title, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        bg-white rounded-2xl 
        p-6                 /* ⬅️ medium */
        min-h-[157px]      /* ⬅️ tinggi pas */
        flex flex-col items-center justify-center
        shadow-lg
        hover:scale-105 transition
        cursor-pointer active:scale-95
      "
    >
      <div className="text-5xl mb-3">{icon}</div> {/* ⬅️ tidak terlalu besar */}
      <p className="text-blue-800 text-base font-semibold text-center">
        {title}
      </p>
    </div>
  );
}

// ===================== CHAT PAGE =====================
const defaultChats = [
  { name: "Odi", avatar: "/odi.jpg" },
  { name: "Faiz",   avatar: "/faiz.jpg" },
  { name: "Chris",   avatar: "/chris.jpg" },
];

function ChatPage({ onNavigate }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [input, setInput]   = useState("");
  const [sender, setSender] = useState("doctor");

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const [chatData, setChatData] = useState(() => {
    const saved = localStorage.getItem("chatData");
    return saved
      ? JSON.parse(saved)
      : {
          Adrian: [{ from: "patient", text: "Dok saya masih nyeri", time: now() }],
          Lala: [],
          Budi: [],
        };
  });

  useEffect(() => {
    localStorage.setItem("chatData", JSON.stringify(chatData));
  }, [chatData]);

  const sendMessage = () => {
    if (!input.trim() || !selectedChat) return;
    const newMsg = { from: sender, text: input, time: now() };
    setChatData((prev) => ({
      ...prev,
      [selectedChat.name]: [...(prev[selectedChat.name] || []), newMsg],
    }));
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8FAADC] to-[#6E8ED6] flex justify-center items-center">
      <div className="w-full max-w-[420px] h-[100dvh] flex flex-col">

        {!selectedChat && (
          <>
            <div className="px-5 pt-4 pb-1 flex items-center gap-3">
              <img src="/Logo_App.png" className="w-25 h-20" />
              <h1 className="text-3xl font-bold text-blue-800 font-cinzel"></h1>
            </div>

            <div className="px-4">
              <div className="bg-[#5E78B5] rounded-full px-4 py-2 flex items-center gap-2 text-white">
                <Search size={18} />
                <input
                  placeholder="Search chat..."
                  className="bg-transparent outline-none w-full placeholder-white/70"
                />
              </div>
            </div>

            <div className="p-4 flex-1">
              <div className="bg-white rounded-2xl shadow-xl p-3 h-full">
                <div className="space-y-2 overflow-y-auto h-full">
                  {defaultChats.map((c, i) => {
                    const lastMsg = chatData[c.name]?.slice(-1)[0];
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedChat(c)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition border-b last:border-none"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {c.avatar ? (
                            <img src={c.avatar} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">👤</div>
                          )}
                          <div className="flex flex-col flex-1 text-left min-w-0">
                            <p className="font-semibold text-base text-gray-800 truncate">{c.name}</p>
                            <p className="text-xs text-gray-500 truncate">{lastMsg?.text || "Belum ada chat"}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{lastMsg?.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {selectedChat && (
          <>
            <div className="p-4 flex items-center gap-3">
              <ArrowLeft onClick={() => setSelectedChat(null)} className="cursor-pointer text-black" />
              {selectedChat.avatar ? (
                <img src={selectedChat.avatar} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-start text-white">👤</div>
              )}
              <h1 className="font-bold">{selectedChat.name}</h1>
            </div>

<div className="flex-1 px-4 py-2 overflow-y-auto space-y-2 bg-[#E5ECFF] rounded-t-2xl">
  {(chatData[selectedChat.name] || []).map((m, i) => (
    
    <div key={i} className={`flex flex-col ${m.from === "doctor" ? "items-end" : "items-start"}`}>
      
      <div
        className={`inline-block max-w-[75%] px-4 py-2 rounded-2xl text-sm break-words ${
          m.from === "doctor"
            ? "bg-blue-500 text-white"
            : "bg-white text-black"
        }`}
      >
        {m.text}
      </div>

      <p className="text-[10px] mt-1 text-gray-400">
        {m.time}
      </p>

    </div>

  ))}
</div>

            <div className="p-3 bg-white flex flex-col gap-2">
              <div className="flex justify-center gap-2 text-xs">
                <button
                  onClick={() => setSender("doctor")}
                  className={`px-3 py-1 rounded-full ${sender === "doctor" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  Dokter
                </button>
                <button
                  onClick={() => setSender("patient")}
                  className={`px-3 py-1 rounded-full ${sender === "patient" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                >
                  Pasien
                </button>
              </div>

              <div className="flex gap-2 bg-gray-100 rounded-full px-3 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ketik pesan..."
                  className="flex-1 bg-transparent outline-none"
                />
                <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-full">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}

        <BottomNav active="chat" onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ===================== DATA PASIEN PAGE =====================
function PatientPage({ onNavigate }) {
  const [search, setSearch]     = useState("");
  const [patients, setPatients] = useState([]);

const fetchPatients = async () => {
  try {
const snapshot = await getDocs(collection(db, "patients"));
const data = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
setPatients(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
};

  useEffect(() => { fetchPatients(); }, []);

const handleUpload = async (e, index) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const name = patients[index].name;

    // upload ke firebase storage
    const fileRef = ref(storage, `files/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);

    const url = await getDownloadURL(fileRef);

    // update data di firestore
const patientRef = doc(db, "patients", patients[index].id);
    await updateDoc(patientRef, {
      file: {
        name: file.name,
        url: url,
      },
    });

    fetchPatients();
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload gagal");
  }
};

  const filtered  = patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const total     = patients.length;
  const active    = patients.filter((p) => p.status !== "Recovered").length;
  const recovered = patients.filter((p) => p.status === "Recovered").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8FAADC] to-[#6E8ED6] flex justify-center items-center">
      <div className="w-full max-w-[420px] h-[100dvh] flex flex-col">

        {/* HEADER */}
        <div className="px-5 pt-4 pb-1 flex items-center gap-3">
          <img src="/Logo_App.png" className="w-25 h-20 object-contain" />
          <h1 className="text-3xl font-bold text-blue-900 font-cinzel"></h1>
        </div>

        {/* SEARCH */}
        <div className="px-4 pb-3">
          <div className="bg-[#5E78B5] rounded-full px-4 py-2 flex items-center gap-2 text-white">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pasien..."
              className="bg-transparent outline-none w-full placeholder-white/70"
            />
          </div>
        </div>

        {/* CARD */}
        <div className="flex-1 px-4 pb-4">
          <div className="bg-gray-100 rounded-3xl shadow-inner p-4 h-full flex flex-col">

            <h2 className="text-center text-blue-800 font-semibold mb-4 text-lg">Data Pasien</h2>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
              <div className="bg-white px-3 py-2 rounded-xl shadow text-center">
                <p className="font-semibold text-blue-900">{total}</p>
                <p className="text-black">Total</p>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl shadow text-center">
                <p className="font-semibold text-yellow-600">{active}</p>
                <p className="text-black">Active</p>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl shadow text-center">
                <p className="font-semibold text-green-600">{recovered}</p>
                <p className="text-black">Recovered</p>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl overflow-hidden shadow text-sm">
              <div className="grid grid-cols-4 bg-[#2F4A8A] text-white p-3 font-semibold">
                <span> Nama</span>
                <span className="text-center">Ruangan</span>
                <span className="text-center">Status</span>
                <span className="text-center">File</span>
              </div>

              <div className="max-h-[350px] overflow-y-auto">
                {filtered.map((p, i) => (
                  <div key={i} className="grid grid-cols-4 items-center p-3 border-b last:border-none">
                    <span className="text-black">{p.name}</span>
                    <span className="text-center text-black">{p.room}</span>
                    <span className={`text-center font-medium ${
                      p.status === "Recovered" ? "text-green-500"
                      : p.status === "Waiting" ? "text-yellow-500"
                      : "text-red-500"
                    }`}>
                      {p.status}
                    </span>
                    <div className="flex justify-end items-center gap-2">
                      {p.file ? (
                        <>
                          <button onClick={() => window.open(p.file.url, "_blank")} className="text-blue-600">
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = p.file.url;
                              link.download = p.file.name;
                              link.target ="_blank";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="text-green-600"
                          >
                            <Download size={16} />
                          </button>
                        </>
                      ) : (
                        <span className="text-black text-xs">No File</span>
                      )}
                      <label className="cursor-pointer text-purple-600">
                        <Upload size={16} />
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleUpload(e, i)} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <BottomNav active="pasien" onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ===================== RESUME PAGE =====================
function ResumePage({ onNavigate }) {
  const [locked, setLocked]           = useState(true);
  const [scanning, setScanning]       = useState(false);
  const [showBypass, setShowBypass]   = useState(false);
  const [bypassDone, setBypassDone]   = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  const handleUnlock = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      setLocked(false);
      setScanning(false);
      setSuccessAnim(true);
      setTimeout(() => setSuccessAnim(false), 1500);
    }, 1800);
  };

  const handleBypass = () => {
    setShowBypass(false);
    setLocked(false);
    setBypassDone(true);
    setSuccessAnim(true);
    setTimeout(() => setSuccessAnim(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8FAADC] to-[#6E8ED6] flex justify-center items-center">
      <div className="w-full max-w-[420px] h-[100dvh] flex flex-col">

        {/* HEADER */}
<div className="p-4 flex items-right justify-right gap-3">
  <img 
    src="/Logo_App.png" 
    className="w-25 h-20 object-contain drop-shadow-md"
  />
  <h1 className="text-3xl font-bold text-blue-900 font-cinzel">
  </h1>
</div>
        {/* CONTENT */}
        <div className="flex-1 px-4 pb-4 relative">
          <div className="bg-gray-100 rounded-3xl shadow-inner p-4 h-full flex flex-col items-center">

            {/* TITLE */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">📄</div>
              <h2 className="text-blue-800 font-semibold text-lg">Resume Medis</h2>
            </div>

            {/* LOCKED CARD */}
            <div className={`bg-white rounded-2xl shadow-lg p-6 w-full text-center ${locked ? "opacity-60" : ""}`}>
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="font-bold text-gray-800">FINALISASI RESUME MEDIS</h3>
              <p className="text-xs text-gray-500 mt-1">Sistem mendeteksi pemulangan pasien. Harap otorisasi.</p>
              <div className="mt-4 text-xs text-gray-400">Verifikasi dilakukan melalui overlay biometrik</div>
            </div>

            {/* BIOMETRIC OVERLAY */}
            {locked && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <div className="text-4xl">🔒</div>
                <p className="mt-2 text-sm text-center px-6">
                  Peringatan: Harap selesaikan Resume Medis Pasien Bigmo terlebih dahulu.
                </p>
                <div
                  onClick={handleUnlock}
                  className={`mt-6 w-24 h-24 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                    scanning ? "border-green-400 scale-110 animate-pulse" : "border-white hover:scale-105"
                  }`}
                >
                  <span className="text-4xl">🖐️</span>
                </div>
                <p className="text-xs mt-4 tracking-wide">
                  {scanning ? "Memverifikasi biometrik..." : "Tap untuk verifikasi biometrik"}
                </p>
                <button onClick={() => setShowBypass(true)} className="mt-4 text-red-300 text-xs underline">
                  Emergency Bypass
                </button>
              </div>
            )}

            {/* SUCCESS STATE */}
            {!locked && (
              <div className="mt-4 w-full space-y-4">
                <div className={`text-center transition-all duration-500 ${successAnim ? "scale-110 opacity-100" : "opacity-90"}`}>
                  <p className={`font-semibold text-lg ${bypassDone ? "text-yellow-600" : "text-green-600"}`}>
                    {bypassDone ? "⚠️ Emergency Bypass Aktif" : "✅ Berhasil Diverifikasi"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {bypassDone ? "Aksi tercatat pada audit trail sistem rumah sakit Mayapada" : "Data otomatis dikirim ke sistem rumah sakit Mayapada"}
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow p-4 text-sm">
                  <h3 className="font-semibold text-blue-800 mb-3 text-center">Ringkasan Pasien Yang Dipulangkan</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Nama</span><span className="font-medium">Bigmo</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Ruangan</span><span className="font-medium">067</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-green-600 font-medium">Dipulangkan</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Tanggal Pulang</span><span className="font-medium">Hari ini</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MODAL BYPASS */}
          {showBypass && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-4 w-full max-w-sm text-center shadow-xl">
                <div className="text-3xl text-red-500">⚠️</div>
                <h3 className="font-bold text-red-500 mt-2">Emergency Bypass</h3>
                <p className="text-xs text-red-600 mt-2">
                  Gunakan hanya untuk kondisi darurat. Sistem akan mencatat tindakan ini.
                </p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowBypass(false)} className="flex-1 bg-gray-200 py-2 rounded-full text-sm">Batal</button>
                  <button onClick={handleBypass} className="flex-1 bg-red-500 text-white py-2 rounded-full text-sm">Lanjutkan</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <BottomNav active="resume" onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ===================== REKAM MEDIS PAGE =====================
function RekamPage({ onNavigate }) {
  const [search, setSearch]   = useState("");
  const [records, setRecords] = useState([]);

const fetchRecords = async () => {
  try {
    const snapshot = await getDocs(collection(db, "patients"));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      file: doc.data().file || null
    }));
    setRecords(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
};

  useEffect(() => { fetchRecords(); }, []);

  const filtered = records.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8FAADC] to-[#6E8ED6] flex justify-center items-center">
      <div className="w-full max-w-[420px] h-[100dvh] flex flex-col">

        {/* HEADER */}
        <div className="px-5 pt-4 pb-1 flex items-center gap-3">
          <img src="/Logo_App.png" className="w-25 h-20 object-contain" />
          <h1 className="text-3xl font-bold text-white-800 font-cinzel"></h1>
        </div>

        {/* SEARCH */}
        <div className="px-5 mt-1">
          <div className="bg-[#5E78B5] rounded-full px-4 py-2 flex items-center gap-3 text-white">
            <Search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for information..."
              className="bg-transparent outline-none w-full placeholder-white/70"
            />
          </div>
        </div>

        {/* CARD */}
        <div className="px-4 mt-4 flex-1">
          <div className="bg-white rounded-3xl shadow-2xl p-4 h-full flex flex-col">

            {/* TITLE */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-20 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">❤️</div>
              <h2 className="text-xl font-semibold text-blue-800">Rekam Medis</h2>
            </div>

            {/* TABLE HEADER */}
            <div className="grid grid-cols-2 bg-[#2F4A8A] text-white text-sm font-semibold rounded-t-lg p-3 text-left">
              <span>Nama Pasien</span>
              <span className="text-right">File</span>
            </div>

            {/* TABLE BODY */}
            <div className="bg-gray-50 rounded-b-lg overflow-y-auto flex-1">
              {filtered.map((r, i) => (
                <div key={i} className="grid grid-cols-2 items-center px-4 py-3 border-b text-sm">
{/* NAMA PASIEN */}
  <span className="font-semibold text-gray-800 text-base text-left">
    {r.name}
  </span>

  {/* FILE */}
  <div className="flex justify-end">
    {r.file ? (
      <button
        onClick={() => window.open(r.file.url, "_blank")}
        className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs hover:scale-105 transition"
      >
        <FileText size={14} />
        Lihat
      </button>
    ) : (
      <span className="text-black text-sm font-medium">
        No File
      </span>
    )}
  </div>

</div>
              ))}
            </div>

          </div>
        </div>

        <div className="mt-4">
          <BottomNav active="rekam" onNavigate={onNavigate} />
        </div>

      </div>
    </div>
  );
}
