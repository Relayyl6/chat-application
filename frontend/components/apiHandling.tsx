import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  Method,
} from 'axios';


const API_BASE = 'http://localhost:5001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const method = config.method?.toUpperCase() ?? 'UNKNOWN';
    console.log(`Making ${method} request to ${config.url}`);
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<AxiosError> => {
    const status = error.response?.status;

    if (status === 401) {
      console.error('Unauthorized - redirect to login');
    } else if (status && status >= 500) {
      console.error('Server Error Occurred');
    }

    return Promise.reject(error);
  }
);

/**
 * Generic API handler
 * T = expected response data type
 */
const apiHandling = async <T = unknown>(
  endpoint: string = '',
  method: Method = 'GET',
  data?: unknown,
  options: AxiosRequestConfig = {}
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      url: endpoint,
      method,
      ...options,
    };

    // Attach data correctly based on method
    if (data) {
      if (method.toUpperCase() === 'GET') {
        config.params = data;
      } else {
        config.data = data;
      }
    }

    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error: unknown) {
    console.error('Enhanced API error:', error);

    if (axios.isAxiosError(error)) {
      // Server responded
      if (error.response) {
        const errorData = error.response.data;

        throw new Error(
          errorData?.error ||
            errorData?.message ||
            `HTTP ${error.response.status}: ${error.response.statusText}`
        );
      }

      // No response received
      if (error.request) {
        throw new Error('Network Error - no response received');
      }

      // Axios config error
      throw new Error(error.message);
    }

    // Non-Axios error
    throw new Error('Unknown error occurred');
  }
};

export default apiHandling;
