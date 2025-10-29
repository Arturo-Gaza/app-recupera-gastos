import axiosInstance from "./axiosInstance";

interface RequestData {
  command: string;
  data?: any;
}

const requests = {
  get: (data: RequestData) => axiosInstance.get(data.command),
  getByID: (data: RequestData) => axiosInstance.post(data.command, data.data),
  post: (data: RequestData) => axiosInstance.post(data.command, data.data),
  put: (data: RequestData) => axiosInstance.put(data.command, data.data),
};

export default requests;
