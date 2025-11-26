import axiosInstance from "./axiosInstance";

interface RequestData<T = any> {
  command: string;
  data?: T;
}

const requests = {
  get: ({ command }: RequestData) => axiosInstance.get(command),

  getByID: ({ command, data }: RequestData) =>
    axiosInstance.post(command, data),

  post: ({ command, data }: RequestData) => {
    const isFormData = data instanceof FormData;

    return axiosInstance.post(command, data, {
      headers: {
        ...(isFormData && { "Content-Type": "multipart/form-data" }),
      },
      transformRequest: isFormData
        ? undefined
        : axiosInstance.defaults.transformRequest,
    });
  },

  put: ({ command, data }: RequestData) =>
    axiosInstance.put(command, data),
};

export default requests;
