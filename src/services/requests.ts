import axiosInstance from "./axiosInstance";

interface RequestData {
  command: string;
  data?: any;
}

const requests = {
  get: (data: RequestData) => axiosInstance.get(data.command),
  getByID: (data: RequestData) => axiosInstance.post(data.command, data.data),
  post: (data: RequestData) => {
    const isFormData = data.data instanceof FormData;
    return axiosInstance.post(data.command, data.data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      transformRequest: isFormData ? undefined : axiosInstance.defaults.transformRequest,
    });
  },
  put: (data: RequestData) => axiosInstance.put(data.command, data.data),
};

export default requests;
