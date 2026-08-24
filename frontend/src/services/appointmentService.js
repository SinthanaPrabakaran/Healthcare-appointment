import api from './api';

export const appointmentService = {
  holdSlot: async (data) => {
    const response = await api.post('/appointments/hold', data);
    return response.data;
  },

  confirmAppointment: async (id) => {
    const response = await api.post(`/appointments/${id}/confirm`);
    return response.data;
  },

  bookAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  getPatientAppointments: async () => {
    const response = await api.get('/appointments/my');
    return response.data;
  },

  getDoctorAppointments: async () => {
    const response = await api.get('/appointments/doctor');
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  generatePreVisitSummary: async (id) => {
    const response = await api.post(`/appointments/${id}/previsit-summary`);
    return response.data;
  },

  getPreVisitSummary: async (id) => {
    const response = await api.get(`/appointments/${id}/previsit-summary`);
    return response.data;
  },

  completeConsultation: async (id, data) => {
    const response = await api.put(`/appointments/${id}/complete`, data);
    return response.data;
  },

  generatePostVisitSummary: async (id) => {
    const response = await api.post(`/appointments/${id}/postvisit-summary`);
    return response.data;
  }
};
