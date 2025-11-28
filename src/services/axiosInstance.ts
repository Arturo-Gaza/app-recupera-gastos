import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

//para produccion
// const axiosInstance = axios.create({
//   baseURL: "https://qa.iarecupera.cloud/api/api",
//   headers: {},
// });


//para local pero en apk
const axiosInstance = axios.create({
  baseURL: "http://192.168.1.171:8000/api/",
  headers: {},
});

// const axiosInstance = axios.create({
//   baseURL: config.BASE_URL,
//   headers: {}, 
// });

// Interceptor para agregar token automáticamente
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const sesionJson = await AsyncStorage.getItem("SesionSSTFull");
      if (sesionJson) {
        const sesion = JSON.parse(sesionJson);
        const token = sesion?.TokenSST;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn("Error obteniendo token:", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    //console.error("Error de API:", error?.response || error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
