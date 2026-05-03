// // import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import api from "../api/axios";

// // export default function PDFs() {
// //   const navigate = useNavigate();

// //   // ---------- STATE ----------
// //   const [registeredPdfs, setRegisteredPdfs] = useState([]);
// //   const [drivePdfs, setDrivePdfs] = useState([]);
// //   const [driveConnected, setDriveConnected] = useState(true);
// //   const [loadingRegistered, setLoadingRegistered] = useState(true);
// //   const [loadingDrive, setLoadingDrive] = useState(false);
// //   const [registeringId, setRegisteringId] = useState(null);

// //   // ---------- FETCH REGISTERED PDFs (ALWAYS) ----------
// //   const fetchRegisteredPdfs = () => {
// //     setLoadingRegistered(true);
// //     api.get("/resources/pdfs/")
// //       .then(res => setRegisteredPdfs(res.data))
// //       .finally(() => setLoadingRegistered(false));
// //   };

// //   // ---------- FETCH DRIVE PDFs (OPTIONAL) ----------
// //   const fetchDrivePdfs = () => {
// //     setLoadingDrive(true);
// //     api.get("/resources/drive/pdfs/")
// //       .then(res => {
// //         setDrivePdfs(res.data);
// //         setDriveConnected(true);
// //       })
// //       .catch(err => {
// //         if (err.response?.status === 403) {
// //           setDriveConnected(false);
// //         }
// //       })
// //       .finally(() => setLoadingDrive(false));
// //   };

// //   useEffect(() => {
// //     fetchRegisteredPdfs();
// //     fetchDrivePdfs(); // best-effort only
// //   }, []);

// //   // ---------- CONNECT DRIVE ----------
// //   const connectDrive = () => {
// //     const redirect = encodeURIComponent(
// //       "http://localhost:5173/dashboard/pdfs"
// //     );

// //     window.location.href =
// //       `http://127.0.0.1:8000/accounts/google/login/?process=connect&next=${redirect}`;
// //   };

// //   // ---------- REGISTER PDF ----------
// //   const registerPdf = async (pdf) => {
// //     setRegisteringId(pdf.id);

// //     await api.post("/resources/pdfs/register/", pdf);
// //     await fetchRegisteredPdfs();

// //     setRegisteringId(null);
// //   };

// //   const isAlreadyRegistered = (drivePdfId) =>
// //     registeredPdfs.some(p => p.drive_file_id === drivePdfId);

// //   // ---------- UI ----------
// //   return (
// //     <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "60px" }}>
// //       <h1 style={{ marginBottom: "24px" }}>Your PDFs</h1>

// //       {/* ================= REGISTERED PDFs ================= */}
// //       <section style={{ marginBottom: "48px" }}>
// //         <h2 style={{ marginBottom: "16px" }}>📄 Registered PDFs</h2>

// //         {loadingRegistered && <p>Loading your PDFs...</p>}

// //         {!loadingRegistered && registeredPdfs.length === 0 && (
// //           <p style={{ color: "#6b7280" }}>
// //             No PDFs registered yet. Add one from Google Drive below.
// //           </p>
// //         )}

// //         <div style={{ display: "grid", gap: "16px" }}>
// //           {registeredPdfs.map(pdf => (
// //             <div
// //               key={pdf.id}
// //               style={{
// //                 border: "1px solid #e5e7eb",
// //                 borderRadius: "10px",
// //                 padding: "16px",
// //                 display: "flex",
// //                 justifyContent: "space-between",
// //                 alignItems: "center",
// //                 background: "#fff",
// //               }}
// //             >
// //               <div>
// //                 <h3 style={{ marginBottom: "4px" }}>{pdf.name}</h3>
// //                 <p style={{ fontSize: "13px", color: "#6b7280" }}>
// //                   Added on {new Date(pdf.created_at).toLocaleDateString()}
// //                 </p>
// //               </div>

// //               <button
// //                 onClick={() => navigate(`/dashboard/study/${pdf.id}`)}
// //                 style={{
// //                   padding: "8px 14px",
// //                   borderRadius: "6px",
// //                   border: "none",
// //                   background: "#16a34a",
// //                   color: "#fff",
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 Study →
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       </section>

// //       {/* ================= ADD FROM DRIVE ================= */}
// //       <section>
// //         <h2 style={{ marginBottom: "16px" }}>➕ Add from Google Drive</h2>

// //         {!driveConnected && (
// //           <div
// //             style={{
// //               border: "2px dashed #e5e7eb",
// //               borderRadius: "10px",
// //               padding: "32px",
// //               textAlign: "center",
// //             }}
// //           >
// //             <p style={{ marginBottom: "12px", color: "#6b7280" }}>
// //               Connect Google Drive to add more PDFs.
// //             </p>
// //             <button
// //               onClick={connectDrive}
// //               style={{
// //                 padding: "10px 18px",
// //                 borderRadius: "6px",
// //                 border: "none",
// //                 background: "#2563eb",
// //                 color: "#fff",
// //                 cursor: "pointer",
// //               }}
// //             >
// //               Connect Google Drive
// //             </button>
// //           </div>
// //         )}

// //         {driveConnected && loadingDrive && <p>Loading Drive PDFs...</p>}

// //         {driveConnected && !loadingDrive && drivePdfs.length === 0 && (
// //           <p style={{ color: "#6b7280" }}>
// //             No PDFs found in your Google Drive.
// //           </p>
// //         )}

// //         {driveConnected && drivePdfs.length > 0 && (
// //           <div
// //             style={{
// //               border: "1px solid #e5e7eb",
// //               borderRadius: "10px",
// //               overflow: "hidden",
// //             }}
// //           >
// //             {drivePdfs.map(pdf => {
// //               const registered = isAlreadyRegistered(pdf.id);

// //               return (
// //                 <div
// //                   key={pdf.id}
// //                   style={{
// //                     padding: "14px 16px",
// //                     borderBottom: "1px solid #e5e7eb",
// //                     display: "flex",
// //                     justifyContent: "space-between",
// //                     alignItems: "center",
// //                     background: registered ? "#f9fafb" : "#fff",
// //                   }}
// //                 >
// //                   <span
// //                     style={{
// //                       color: registered ? "#9ca3af" : "#111827",
// //                     }}
// //                   >
// //                     {pdf.name}
// //                   </span>

// //                   {registered ? (
// //                     <span style={{ fontSize: "13px", color: "#16a34a" }}>
// //                       ✓ Registered
// //                     </span>
// //                   ) : (
// //                     <button
// //                       disabled={registeringId === pdf.id}
// //                       onClick={() => registerPdf(pdf)}
// //                       style={{
// //                         padding: "6px 12px",
// //                         borderRadius: "6px",
// //                         border: "none",
// //                         background: "#2563eb",
// //                         color: "#fff",
// //                         cursor: "pointer",
// //                         opacity: registeringId === pdf.id ? 0.6 : 1,
// //                       }}
// //                     >
// //                       {registeringId === pdf.id ? "Adding..." : "Register"}
// //                     </button>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         )}
// //       </section>
// //     </div>
// //   );
// // }

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";

// export default function PDFs() {
//   const navigate = useNavigate();

//   const [registeredPdfs, setRegisteredPdfs] = useState([]);
//   const [drivePdfs, setDrivePdfs] = useState([]);
//   const [driveConnected, setDriveConnected] = useState(true);
//   const [loadingRegistered, setLoadingRegistered] = useState(true);
//   const [loadingDrive, setLoadingDrive] = useState(false);
//   const [registeringId, setRegisteringId] = useState(null);

//   const fetchRegisteredPdfs = () => {
//     setLoadingRegistered(true);
//     api.get("/resources/pdfs/")
//       .then(res => setRegisteredPdfs(res.data))
//       .finally(() => setLoadingRegistered(false));
//   };

//   const fetchDrivePdfs = () => {
//     setLoadingDrive(true);
//     api.get("/resources/drive/pdfs/")
//       .then(res => {
//         setDrivePdfs(res.data);
//         setDriveConnected(true);
//       })
//       .catch(err => {
//         if (err.response?.status === 403) {
//           setDriveConnected(false);
//         }
//       })
//       .finally(() => setLoadingDrive(false));
//   };

//   useEffect(() => {
//     fetchRegisteredPdfs();
//     fetchDrivePdfs();
//   }, []);

//   const connectDrive = () => {
//     const redirect = encodeURIComponent(
//       "http://localhost:5173/dashboard/pdfs"
//     );

//     window.location.href =
//       `http://127.0.0.1:8000/accounts/google/login/?process=connect&next=${redirect}`;
//   };

//   const registerPdf = async (pdf) => {
//     setRegisteringId(pdf.id);
//     await api.post("/resources/pdfs/register/", pdf);
//     await fetchRegisteredPdfs();
//     setRegisteringId(null);
//   };

//   const isAlreadyRegistered = (drivePdfId) =>
//     registeredPdfs.some(p => p.drive_file_id === drivePdfId);

//   return (
//     <div className="min-h-screen bg-linear-to-br from-[#fff5f2] via-white to-[#fff1ec] px-6 py-12">

//       <div className="max-w-6xl mx-auto">

//         {/* HEADER */}
//         <div className="mb-12">
//           <h1 className="text-3xl font-semibold text-gray-800">
//             Your PDFs
//           </h1>
//           <p className="text-sm text-gray-500 mt-2">
//             Manage your study materials and import from Google Drive.
//           </p>
//         </div>

//         {/* ================= REGISTERED PDFs ================= */}
//         <section className="mb-16">

//           <h2 className="text-xl font-semibold text-gray-800 mb-6">
//             Registered PDFs
//           </h2>

//           {loadingRegistered && (
//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="h-28 bg-orange-100 rounded-3xl animate-pulse"></div>
//               <div className="h-28 bg-orange-100 rounded-3xl animate-pulse"></div>
//             </div>
//           )}

//           {!loadingRegistered && registeredPdfs.length === 0 && (
//             <div className="bg-white rounded-3xl p-10 border border-orange-100 text-center text-gray-500 shadow-sm">
//               No PDFs registered yet.
//             </div>
//           )}

//           <div className="grid md:grid-cols-2 gap-6">
//             {registeredPdfs.map(pdf => (
//               <div
//                 key={pdf.id}
//                 className="relative bg-white rounded-3xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition overflow-hidden group"
//               >
//                 <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-400 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition"></div>

//                 <div className="relative flex justify-between items-center">

//                   <div>
//                     <h3 className="font-semibold text-gray-800 mb-1">
//                       {pdf.name}
//                     </h3>
//                     <p className="text-xs text-gray-400">
//                       Added {new Date(pdf.created_at).toLocaleDateString()}
//                     </p>
//                   </div>

//                   <button
//                     onClick={() => navigate(`/dashboard/study/${pdf.id}`)}
//                     className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow hover:shadow-lg hover:scale-[1.05] active:scale-[0.95] transition"
//                   >
//                     Study →
//                   </button>

//                 </div>
//               </div>
//             ))}
//           </div>

//         </section>

//         {/* ================= ADD FROM DRIVE ================= */}
//         <section>

//           <h2 className="text-xl font-semibold text-gray-800 mb-6">
//             Add from Google Drive
//           </h2>

//           {!driveConnected && (
//             <div className="bg-white rounded-3xl p-12 border border-dashed border-orange-200 text-center shadow-sm">
//               <p className="text-gray-500 mb-6">
//                 Connect Google Drive to import your PDFs.
//               </p>
//               <button
//                 onClick={connectDrive}
//                 className="px-6 py-3 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white font-medium shadow hover:shadow-lg transition"
//               >
//                 Connect Google Drive
//               </button>
//             </div>
//           )}

//           {driveConnected && loadingDrive && (
//             <div className="h-32 bg-orange-100 rounded-3xl animate-pulse"></div>
//           )}

//           {driveConnected && !loadingDrive && drivePdfs.length === 0 && (
//             <div className="bg-white rounded-3xl p-10 border border-orange-100 text-center text-gray-500 shadow-sm">
//               No PDFs found in your Google Drive.
//             </div>
//           )}

//           {driveConnected && drivePdfs.length > 0 && (
//             <div className="bg-white rounded-3xl shadow-md border border-orange-100 divide-y divide-orange-100 overflow-hidden">

//               {drivePdfs.map(pdf => {
//                 const registered = isAlreadyRegistered(pdf.id);

//                 return (
//                   <div
//                     key={pdf.id}
//                     className={`flex justify-between items-center px-6 py-4 transition ${
//                       registered
//                         ? "bg-orange-50"
//                         : "hover:bg-orange-50/50"
//                     }`}
//                   >
//                     <span className={`text-sm ${
//                       registered ? "text-gray-400" : "text-gray-800"
//                     }`}>
//                       {pdf.name}
//                     </span>

//                     {registered ? (
//                       <span className="text-xs font-medium text-green-600">
//                         ✓ Registered
//                       </span>
//                     ) : (
//                       <button
//                         disabled={registeringId === pdf.id}
//                         onClick={() => registerPdf(pdf)}
//                         className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow hover:shadow-lg transition disabled:opacity-50"
//                       >
//                         {registeringId === pdf.id ? "Adding..." : "Register"}
//                       </button>
//                     )}
//                   </div>
//                 );
//               })}

//             </div>
//           )}

//         </section>

//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { backendBaseUrl, frontendBaseUrl } from "../config";

export default function PDFs() {

  const navigate = useNavigate();

  const [registeredPdfs, setRegisteredPdfs] = useState([]);
  const [drivePdfs, setDrivePdfs] = useState([]);

  const [driveConnected, setDriveConnected] = useState(true);

  const [loadingRegistered, setLoadingRegistered] = useState(true);
  const [loadingDrive, setLoadingDrive] = useState(false);

  const [registeringId, setRegisteringId] = useState(null);

  /* ---------------- REGISTERED PDFs ---------------- */

  const fetchRegisteredPdfs = () => {

    setLoadingRegistered(true);

    api.get("/resources/pdfs/")
      .then(res => setRegisteredPdfs(res.data))
      .finally(() => setLoadingRegistered(false));
  };

  /* ---------------- DRIVE PDFs ---------------- */

  const fetchDrivePdfs = () => {

    setLoadingDrive(true);

    api.get("/resources/drive/pdfs/")
      .then(res => {

        setDrivePdfs(res.data);
        setDriveConnected(true);

      })
      .catch(err => {

        if (err.response?.status === 403) {
          setDriveConnected(false);
        }

      })
      .finally(() => setLoadingDrive(false));
  };

  useEffect(() => {

    fetchRegisteredPdfs();
    fetchDrivePdfs();

  }, []);

  /* ---------------- CONNECT DRIVE ---------------- */

  const connectDrive = () => {

    const redirect = encodeURIComponent(
      `${frontendBaseUrl}/dashboard/pdfs`
    );

    window.location.href =
      `${backendBaseUrl}/accounts/google/login/?process=connect&next=${redirect}`;
  };

  /* ---------------- REGISTER PDF ---------------- */

  const registerPdf = async (pdf) => {

    setRegisteringId(pdf.id);

    await api.post("/resources/pdfs/register/", pdf);

    await fetchRegisteredPdfs();

    setRegisteringId(null);
  };

  const isAlreadyRegistered = (drivePdfId) =>
    registeredPdfs.some(p => p.drive_file_id === drivePdfId);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-linear-to-br from-[#fff5f2] via-white to-[#fff1ec] px-6 py-12">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-3xl font-semibold text-gray-800">
            Your Study Materials
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Manage your PDFs and import study resources from Google Drive.
          </p>

        </div>

        {/* DRIVE STATUS BANNER */}

        <div className="mb-12">

          {driveConnected ? (

            <div className="flex items-center justify-between bg-white border border-green-200 rounded-2xl p-4 shadow-sm">

              <div className="text-sm text-green-700 font-medium">
                ✓ Google Drive Connected
              </div>

              <button
                onClick={connectDrive}
                className="text-xs px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              >
                Reconnect
              </button>

            </div>

          ) : (

            <div className="flex items-center justify-between bg-white border border-orange-200 rounded-2xl p-4 shadow-sm">

              <div className="text-sm text-orange-600 font-medium">
                Google Drive not connected
              </div>

              <button
                onClick={connectDrive}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white text-sm shadow hover:shadow-lg transition"
              >
                Connect Drive
              </button>

            </div>

          )}

        </div>

        {/* REGISTERED PDFs */}

        <section className="mb-16">

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Registered PDFs
          </h2>

          {loadingRegistered && (

            <div className="grid md:grid-cols-2 gap-6">

              <div className="h-28 bg-orange-100 rounded-3xl animate-pulse"></div>
              <div className="h-28 bg-orange-100 rounded-3xl animate-pulse"></div>

            </div>

          )}

          {!loadingRegistered && registeredPdfs.length === 0 && (

            <div className="bg-white rounded-3xl p-10 border border-orange-100 text-center text-gray-500 shadow-sm">
              No PDFs registered yet.
            </div>

          )}

          <div className="grid md:grid-cols-2 gap-6">

            {registeredPdfs.map(pdf => (

              <div
                key={pdf.id}
                className="relative bg-white rounded-3xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition overflow-hidden group"
              >

                <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-400 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition"></div>

                <div className="relative flex justify-between items-center">

                  <div>

                    <h3 className="font-semibold text-gray-800 mb-1">
                      {pdf.name}
                    </h3>

                    <p className="text-xs text-gray-400">
                      Added {new Date(pdf.created_at).toLocaleDateString()}
                    </p>

                  </div>

                  <button
                    onClick={() => navigate(`/dashboard/study/${pdf.id}`)}
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow hover:shadow-lg hover:scale-[1.05] active:scale-[0.95] transition"
                  >
                    Study →
                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* GOOGLE DRIVE FILES */}

        <section>

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Import from Google Drive
          </h2>

          {!driveConnected && (

            <div className="bg-white rounded-3xl p-12 border border-dashed border-orange-200 text-center shadow-sm">

              <p className="text-gray-500 mb-6">
                Connect Google Drive to access your study PDFs.
              </p>

              <button
                onClick={connectDrive}
                className="px-6 py-3 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white font-medium shadow hover:shadow-lg transition"
              >
                Connect Google Drive
              </button>

            </div>

          )}

          {driveConnected && loadingDrive && (

            <div className="h-32 bg-orange-100 rounded-3xl animate-pulse"></div>

          )}

          {driveConnected && !loadingDrive && drivePdfs.length === 0 && (

            <div className="bg-white rounded-3xl p-10 border border-orange-100 text-center text-gray-500 shadow-sm">
              No PDFs found in your Google Drive.
            </div>

          )}

          {driveConnected && drivePdfs.length > 0 && (

            <div className="bg-white rounded-3xl shadow-md border border-orange-100 divide-y divide-orange-100 overflow-hidden">

              {drivePdfs.map(pdf => {

                const registered = isAlreadyRegistered(pdf.id);

                return (

                  <div
                    key={pdf.id}
                    className={`flex justify-between items-center px-6 py-4 transition ${
                      registered
                        ? "bg-orange-50"
                        : "hover:bg-orange-50/50"
                    }`}
                  >

                    <span className={`text-sm ${
                      registered ? "text-gray-400" : "text-gray-800"
                    }`}>
                      {pdf.name}
                    </span>

                    {registered ? (

                      <span className="text-xs font-medium text-green-600">
                        ✓ Registered
                      </span>

                    ) : (

                      <button
                        disabled={registeringId === pdf.id}
                        onClick={() => registerPdf(pdf)}
                        className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow hover:shadow-lg transition disabled:opacity-50"
                      >
                        {registeringId === pdf.id ? "Adding..." : "Register"}
                      </button>

                    )}

                  </div>

                );

              })}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}
