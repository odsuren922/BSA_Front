import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // API серверийн үндсэн URL-ийг зааж өгнө.

axios.defaults.withCredentials = true; // Күүки болон бусад authentication мэдээллийг илгээхийн тулд "withCredentials"-г идэвхжүүлнэ.

// CSRF токен олох хэсэг
const csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
if (csrfTokenElement) {
  // Хэрэв CSRF токен meta tag-аас олдвол axios-ийн headers-д автоматаар нэмнэ.
  const csrfToken = csrfTokenElement.getAttribute("content");
  axios.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
} else {
  // Хэрэв CSRF токен олдохгүй бол анхааруулга харуулна.
  console.warn("CSRF токен meta tag-аас олдсонгүй.");
}

// Өгөгдөл авах функц
export const fetchData = async (endpoint, params = {}) => {
  try {
    // API-с өгөгдөл татах GET хүсэлт илгээнэ.
    const response = await axios.get(`${API_URL}/${endpoint}`, {
      params: params, // Хүсэлтийн параметрүүдийг дамжуулна.
    });
    return response.data; // Хариу өгөгдлийг буцаана.
  } catch (error) {
    // Алдаа гарвал console дээр харуулна.
    console.log("Өгөгдөл татах үед алдаа гарлаа:", error);
    throw error; // Алдааг шидэж, дээд түвшинд мэдээлнэ.
  }
};

// Өгөгдөл илгээх функц
export const postData = async (endpoint, data, method = "post") => {
  try {
    // API-д өгөгдөл илгээх хүсэлт илгээнэ. Method-г POST эсвэл PUT сонгож болно.
    const response = await axios({
      method: method, // HTTP хүсэлтийн аргыг зааж өгнө (жишээ нь: POST, PUT).
      url: `${API_URL}/${endpoint}`, // Хүсэлтийг илгээх API замыг тодорхойлно.
      data: data, // Илгээж буй өгөгдөл.
      headers: {
        "X-CSRF-TOKEN": axios.defaults.headers.common["X-CSRF-TOKEN"], // CSRF хамгаалалтыг headers-д оруулна.
      },
    });
    return response.data; // Хариу өгөгдлийг буцаана.
  } catch (error) {
    // Алдаа гарвал console дээр харуулна.
    console.log("Өгөгдөл илгээх үед алдаа гарлаа:", error);
    throw error; // Алдааг шидэж, дээд түвшинд мэдээлнэ.
  }
};
