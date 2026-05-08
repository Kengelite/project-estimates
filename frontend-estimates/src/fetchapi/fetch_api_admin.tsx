import axios from "axios";

const api = "http://localhost:3001";

/* =========================
   YEAR
========================= */

export async function GetDataYear() {
  try {
    const response = await axios.get(`${api}/api/years`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching years:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลปีการศึกษาได้";
    throw message;
  }
}

export async function AddDataYear(data: { year: string; status: string }) {
  try {
    const response = await axios.post(`${api}/api/years`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding year:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลปีการศึกษาได้";
    throw message;
  }
}

export async function EditDataYear(
  id: number,
  data: { year: string; status: string },
) {
  try {
    const response = await axios.put(`${api}/api/years/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating year:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลปีการศึกษาได้";
    throw message;
  }
}

export async function EditStatusYear(id: number, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/years/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating year status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะปีการศึกษาได้";
    throw message;
  }
}

export async function DeleteDataYear(id: number) {
  try {
    const response = await axios.delete(`${api}/api/years/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting year:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลปีการศึกษาได้";
    throw message;
  }
}

/* =========================
   DEGREE LEVEL
========================= */

export async function GetDataDegreeLevel() {
  try {
    const response = await axios.get(`${api}/api/degree-levels`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching degree levels:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลระดับปริญญาได้";
    throw message;
  }
}

export async function AddDataDegreeLevel(data: {
  section_id: number;
  name: string;
  short_name: string;
  status: string;
}) {
  try {
    const response = await axios.post(`${api}/api/degree-levels`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding degree level:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลระดับปริญญาได้";
    throw message;
  }
}

export async function EditDataDegreeLevel(
  id: string,
  data: {
    section_id: number;
    name: string;
    short_name: string;
    status: string;
  },
) {
  try {
    const response = await axios.put(`${api}/api/degree-levels/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating degree level:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลระดับปริญญาได้";
    throw message;
  }
}

export async function EditStatusDegreeLevel(id: string, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/degree-levels/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating degree level status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะระดับปริญญาได้";
    throw message;
  }
}

export async function DeleteDataDegreeLevel(id: string) {
  try {
    const response = await axios.delete(`${api}/api/degree-levels/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting degree level:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลระดับปริญญาได้";
    throw message;
  }
}

/* =========================
   SECTION
========================= */

export async function GetDataSection() {
  try {
    const response = await axios.get(`${api}/api/sections`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching sections:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลโครงการระดับปริญญาได้";
    throw message;
  }
}

export async function AddDataSection(data: {
  section_name: string;
  status: string;
}) {
  try {
    const response = await axios.post(`${api}/api/sections`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding section:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลโครงการระดับปริญญาได้";
    throw message;
  }
}

export async function EditDataSection(
  id: number,
  data: {
    section_name: string;
    status: string;
  },
) {
  try {
    const response = await axios.put(`${api}/api/sections/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating section:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลโครงการระดับปริญญาได้";
    throw message;
  }
}

export async function EditStatusSection(id: number, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/sections/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating section status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะโครงการระดับปริญญาได้";
    throw message;
  }
}

export async function DeleteDataSection(id: number) {
  try {
    const response = await axios.delete(`${api}/api/sections/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting section:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลโครงการระดับปริญญาได้";
    throw message;
  }
}

/* =========================
   SEMESTER
========================= */

export async function GetDataSemester() {
  try {
    const response = await axios.get(`${api}/api/semesters`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching semesters:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลภาคการศึกษาได้";
    throw message;
  }
}

export async function AddDataSemester(data: {
  semester: string;
  status: string;
}) {
  try {
    const response = await axios.post(`${api}/api/semesters`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding semester:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลภาคการศึกษาได้";
    throw message;
  }
}

export async function EditDataSemester(
  id: number,
  data: {
    semester: string;
    status: string;
  },
) {
  try {
    const response = await axios.put(`${api}/api/semesters/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating semester:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลภาคการศึกษาได้";
    throw message;
  }
}

export async function EditStatusSemester(id: number, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/semesters/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating semester status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะภาคการศึกษาได้";
    throw message;
  }
}

export async function DeleteDataSemester(id: number) {
  try {
    const response = await axios.delete(`${api}/api/semesters/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting semester:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลภาคการศึกษาได้";
    throw message;
  }
}

/* =========================
   STUDENT YEAR
========================= */

export async function GetDataStudentYear() {
  try {
    const response = await axios.get(`${api}/api/student-years`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching student years:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลชั้นปีได้";
    throw message;
  }
}

export async function AddDataStudentYear(data: {
  studentYear: string;
  status: string;
}) {
  try {
    const response = await axios.post(`${api}/api/student-years`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding student year:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลชั้นปีได้";
    throw message;
  }
}

export async function EditDataStudentYear(
  id: number,
  data: {
    studentYear: string;
    status: string;
  },
) {
  try {
    const response = await axios.put(`${api}/api/student-years/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating student year:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลชั้นปีได้";
    throw message;
  }
}

export async function EditStatusStudentYear(id: number, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/student-years/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating student year status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะชั้นปีได้";
    throw message;
  }
}

export async function DeleteDataStudentYear(id: number) {
  try {
    const response = await axios.delete(`${api}/api/student-years/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting student year:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลชั้นปีได้";
    throw message;
  }
}

/* =========================
   SUBJECT CATEGORY
========================= */

export async function GetDataSubjectCategory() {
  try {
    const response = await axios.get(`${api}/api/subject-categories`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching subject categories:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลหมวดวิชาได้";
    throw message;
  }
}

export async function AddDataSubjectCategory(data: {
  name: string;
  status: string;
}) {
  try {
    const response = await axios.post(`${api}/api/subject-categories`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding subject category:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลหมวดวิชาได้";
    throw message;
  }
}

export async function EditDataSubjectCategory(
  id: string,
  data: {
    name: string;
    status: string;
  },
) {
  try {
    const response = await axios.put(
      `${api}/api/subject-categories/${id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating subject category:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลหมวดวิชาได้";
    throw message;
  }
}

export async function EditStatusSubjectCategory(id: string, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/subject-categories/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating subject category status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะหมวดวิชาได้";
    throw message;
  }
}

export async function DeleteDataSubjectCategory(id: string) {
  try {
    const response = await axios.delete(`${api}/api/subject-categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting subject category:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลหมวดวิชาได้";
    throw message;
  }
}

/* =========================
   SUBJECT OUTSIDE
========================= */

export async function GetDataSubjectOutside() {
  try {
    const response = await axios.get(`${api}/api/subject-outsides`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching subject outsides:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลวิชานอกคณะได้";
    throw message;
  }
}

export async function AddDataSubjectOutside(data: {
  subjectCode: string;
  subjectName: string;
  status: string;
}) {
  try {
    const response = await axios.post(`${api}/api/subject-outsides`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding subject outside:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลวิชานอกคณะได้";
    throw message;
  }
}

export async function EditDataSubjectOutside(
  id: string,
  data: {
    subjectCode: string;
    subjectName: string;
    status: string;
  },
) {
  try {
    const response = await axios.put(
      `${api}/api/subject-outsides/${id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating subject outside:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลวิชานอกคณะได้";
    throw message;
  }
}

export async function EditStatusSubjectOutside(id: string, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/subject-outsides/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating subject outside status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะวิชานอกคณะได้";
    throw message;
  }
}

export async function DeleteDataSubjectOutside(id: string) {
  try {
    const response = await axios.delete(`${api}/api/subject-outsides/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting subject outside:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลวิชานอกคณะได้";
    throw message;
  }
}

/* =========================
   FUND
========================= */

export async function GetDataFund() {
  try {
    const response = await axios.get(`${api}/api/funds`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching funds:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลแหล่งทุนได้";
    throw message;
  }
}

export async function AddDataFund(data: {
  name: string;
  pctSplit: number;
  status: string;
}) {
  try {
    const response = await axios.post(`${api}/api/funds`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding fund:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลแหล่งทุนได้";
    throw message;
  }
}

export async function EditDataFund(
  id: string,
  data: {
    name: string;
    pctSplit: number;
    status: string;
  },
) {
  try {
    const response = await axios.put(`${api}/api/funds/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating fund:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลแหล่งทุนได้";
    throw message;
  }
}

export async function EditStatusFund(id: string, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/funds/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating fund status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะแหล่งทุนได้";
    throw message;
  }
}

export async function DeleteDataFund(id: string) {
  try {
    const response = await axios.delete(`${api}/api/funds/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting fund:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลแหล่งทุนได้";
    throw message;
  }
}

/* =========================
   CENTRAL
========================= */

export async function GetDataCentral() {
  try {
    const response = await axios.get(`${api}/api/centrals`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching centrals:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลส่วนกลางได้";
    throw message;
  }
}

export async function AddDataCentral(data: {
  name: string;
  status: string;
  splits: {
    splitGroup: "bachelor_normal" | "bachelor_special" | "graduate";
    pctSplit: number;
  }[];
}) {
  try {
    const response = await axios.post(`${api}/api/centrals`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding central:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลส่วนกลางได้";
    throw message;
  }
}

export async function EditDataCentral(
  id: string,
  data: {
    name: string;
    status: string;
    splits: {
      splitGroup: "bachelor_normal" | "bachelor_special" | "graduate";
      pctSplit: number;
    }[];
  },
) {
  try {
    const response = await axios.put(`${api}/api/centrals/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating central:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลส่วนกลางได้";
    throw message;
  }
}

export async function EditStatusCentral(id: string, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/centrals/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating central status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะส่วนกลางได้";
    throw message;
  }
}

export async function DeleteDataCentral(id: string) {
  try {
    const response = await axios.delete(`${api}/api/centrals/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting central:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลส่วนกลางได้";
    throw message;
  }
}

/* =========================
   UNIVERSITY WORK
========================= */

export async function GetDataUniversityWork() {
  try {
    const response = await axios.get(`${api}/api/university-works`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching university works:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลงานมหาวิทยาลัยได้";
    throw message;
  }
}

export async function AddDataUniversityWork(data: {
  name: string;
  status: string;
  splits: {
    splitGroup: "bachelor_normal" | "bachelor_special" | "graduate";
    pctSplit: number;
  }[];
}) {
  try {
    const response = await axios.post(`${api}/api/university-works`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding university work:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลงานมหาวิทยาลัยได้";
    throw message;
  }
}

export async function EditDataUniversityWork(
  id: string,
  data: {
    name: string;
    status: string;
    splits: {
      splitGroup: "bachelor_normal" | "bachelor_special" | "graduate";
      pctSplit: number;
    }[];
  },
) {
  try {
    const response = await axios.put(`${api}/api/university-works/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating university work:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลงานมหาวิทยาลัยได้";
    throw message;
  }
}

export async function EditStatusUniversityWork(id: string, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/university-works/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating university work status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะงานมหาวิทยาลัยได้";
    throw message;
  }
}

export async function DeleteDataUniversityWork(id: string) {
  try {
    const response = await axios.delete(`${api}/api/university-works/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting university work:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลงานมหาวิทยาลัยได้";
    throw message;
  }
}

/* =========================
   CURRICULUM
========================= */

export async function GetDataCurriculum() {
  try {
    const response = await axios.get(`${api}/api/curriculums`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching curriculums:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลหลักสูตรได้";
    throw message;
  }
}

export async function AddDataCurriculum(data: {
  name: string;
  status: string;
  splits: {
    splitGroup: "bachelor_normal" | "bachelor_special" | "graduate";
    pctSplit: number;
  }[];
}) {
  try {
    const response = await axios.post(`${api}/api/curriculums`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding curriculum:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลหลักสูตรได้";
    throw message;
  }
}

export async function EditDataCurriculum(
  id: string,
  data: {
    name: string;
    status: string;
    splits: {
      splitGroup: "bachelor_normal" | "bachelor_special" | "graduate";
      pctSplit: number;
    }[];
  },
) {
  try {
    const response = await axios.put(`${api}/api/curriculums/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating curriculum:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลหลักสูตรได้";
    throw message;
  }
}

export async function EditStatusCurriculum(id: string, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/curriculums/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating curriculum status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะหลักสูตรได้";
    throw message;
  }
}

export async function DeleteDataCurriculum(id: string) {
  try {
    const response = await axios.delete(`${api}/api/curriculums/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting curriculum:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลหลักสูตรได้";
    throw message;
  }
}

/* =========================
   COURSE
========================= */

export async function GetDataCourse() {
  try {
    const response = await axios.get(`${api}/api/courses`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลหลักสูตรได้";
    throw message;
  }
}

export async function GetDataCourseGrouped() {
  try {
    const response = await axios.get(`${api}/api/courses/grouped`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data?.data ?? [];
  } catch (error: any) {
    console.error("Error fetching grouped courses:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลหลักสูตรแบบจัดกลุ่มได้";
    throw message;
  }
}

export async function GetDataCourseById(id: string) {
  try {
    const response = await axios.get(`${api}/api/courses/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching course detail:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถดึงข้อมูลรายละเอียดหลักสูตรได้";
    throw message;
  }
}

export async function AddDataCourse(data: {
  degreeLevelId: string;
  nameTh: string;
  nameEn: string;
  shortName: string;
  studyDuration: number;
  tuitionFees: number;
  deductToUni: number;
  status: string;
  structures: {
    subjectCategoryId: string;
    credit: number;
  }[];
  subjectOutsideDeducts: {
    subjectOutsideId: string;
    amount: number;
  }[];
  students: {
    yearId: number;
    studentAmount: number;
  }[];
}) {
  try {
    const response = await axios.post(`${api}/api/courses`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error adding course:", error);
    console.error("Add course payload:", data);
    console.error("Add course error response:", error.response?.data);

    const message =
      error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลหลักสูตรได้";
    throw message;
  }
}

export async function EditDataCourse(
  id: string,
  data: {
    degreeLevelId: string;
    nameTh: string;
    nameEn: string;
    shortName: string;
    studyDuration: number;
    tuitionFees: number;
    deductToUni: number;
    status: string;
  },
) {
  try {
    const response = await axios.put(`${api}/api/courses/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating course:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลหลักสูตรได้";
    throw message;
  }
}

export async function EditStatusCourse(id: string, status: string) {
  try {
    const response = await axios.patch(
      `${api}/api/courses/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating course status:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถอัปเดตสถานะหลักสูตรได้";
    throw message;
  }
}

export async function DeleteDataCourse(id: string) {
  try {
    const response = await axios.delete(`${api}/api/courses/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting course:", error);
    const message =
      error.response?.data?.message || "ไม่สามารถลบข้อมูลหลักสูตรได้";
    throw message;
  }
}