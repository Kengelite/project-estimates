// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../../contexts/useAuth"; // ปรับ path ให้ตรงกับของคุณ

// interface RoleGuardProps {
//   allowedRoles: string[];
// }

// export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
//   const { user } = useAuth();

//   // ป้องกันกรณีที่ยังไม่มีข้อมูล User (ปกติ ProtectedRoute จะดักไว้แล้ว แต่นี่กันเหนียว)
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // ตรวจสอบว่า Role ของ User อยู่ในกลุ่มที่ได้รับอนุญาตให้เข้าหน้านี้หรือไม่
//   if (!allowedRoles.includes(user.role)) {
//     // ถ้าไม่มีสิทธิ์ และเป็น staff ให้บังคับเด้งกลับไปหน้า /responsible เท่านั้น
//     if (user.role === "staff") {
//       return <Navigate to="/responsible" replace />;
//     }
//     // ถ้าเป็น admin แต่หลงมาเข้าหน้าที่ไม่มีสิทธิ์ (เผื่อมีในอนาคต) ให้กลับไป dashboard
//     return <Navigate to="/dashboard" replace />;
//   }

//   // ถ้ามีสิทธิ์ ให้แสดงผลหน้าเว็บตามปกติ
//   return <Outlet />;
// };