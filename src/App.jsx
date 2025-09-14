import React, { useEffect, useState } from "react";

const App = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Doctorsni olish
  useEffect(() => {
    fetch("http://localhost:5000/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data));
  }, []);

  // Appointmentlarni olish + localStorage
  useEffect(() => {
    const saved = localStorage.getItem("appointments");
    if (saved) {
      setAppointments(JSON.parse(saved));
    } else {
      fetch("http://localhost:5000/appointments")
        .then((res) => res.json())
        .then((data) => setAppointments(data));
    }
  }, []);

  // Har safar appointments o‘zgarsa → localStorage’ga saqlash
  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  // Appointment yaratish
  const handleAppointment = () => {
    if (!patientName) return alert("Ismingizni kiriting!");
    const newAppointment = {
      id: Date.now(),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientName,
      status: "pending"
    };

    // Backendga yozish
    fetch("http://localhost:5000/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAppointment)
    })
      .then((res) => res.json())
      .then((data) => {
        setAppointments([...appointments, data]);
        setIsModalOpen(false);
        setPatientName("");

        // ✅ Notification bemor uchun
        alert(
          `Hurmatli ${newAppointment.patientName}, siz ${newAppointment.doctorName} qabuliga yozildingiz!`
        );
      });
  };

  // Navbat kelganda doktorga ham, bemorga ham xabar berish
  const handleNext = (id) => {
    const updated = appointments.map((app) =>
      app.id === id ? { ...app, status: "done" } : app
    );
    setAppointments(updated);

    const finished = appointments.find((app) => app.id === id);
    if (finished) {
      // ✅ Notification bemor
      alert(
        `👉 ${finished.patientName}, sizning navbatingiz keldi! Doktor ${finished.doctorName} kutyapti.`
      );

      // ✅ Notification doktor
      alert(
        `🩺 ${finished.doctorName}, bemor ${finished.patientName} hozir sizning navbatingizda.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Doctor Appointment</h1>
        <span>{appointments.length} ta yozilish</span>
      </header>

      {/* Doctors ro‘yxati */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4"
          >
            <img
              src={doc.image}
              alt={doc.name}
              className="w-32 h-32 mx-auto rounded-full"
            />
            <h2 className="text-lg font-semibold text-center mt-2">{doc.name}</h2>
            <p className="text-center text-gray-600">{doc.specialty}</p>
            <p className="text-center text-sm text-gray-500">{doc.experience}</p>
            <button
              onClick={() => {
                setSelectedDoctor(doc);
                setIsModalOpen(true);
              }}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition"
            >
              Yozilish
            </button>
          </div>
        ))}
      </main>

      {/* Appointmentlar ro‘yxati */}
      <section className="p-6">
        <h2 className="text-lg font-bold mb-4">Yozilgan bemorlar</h2>
        {appointments.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-lg shadow p-4 flex justify-between items-center mb-2"
          >
            <span>
              {app.patientName} → {app.doctorName} ({app.status})
            </span>
            {app.status === "pending" && (
              <button
                onClick={() => handleNext(app.id)}
                className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600"
              >
                Navbati keldi
              </button>
            )}
          </div>
        ))}
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {selectedDoctor?.name} ga yozilish
            </h2>
            <input
              type="text"
              placeholder="Ismingizni kiriting"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAppointment}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
