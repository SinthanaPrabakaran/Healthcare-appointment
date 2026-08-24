import api from './api';

export const calendarService = {
  getConnectUrl: async () => {
    const response = await api.get('/calendar/connect');
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/calendar/status');
    return response.data;
  },

  disconnect: async () => {
    const response = await api.delete('/calendar/disconnect');
    return response.data;
  }
};
