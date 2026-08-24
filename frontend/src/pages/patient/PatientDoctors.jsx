import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [page]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await doctorService.getDoctors({ name, specialization, page, limit: 6 });
      setDoctors(data.doctors || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctors list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Find & Book Specialist Doctors</h1>
          <p className="text-sm text-gray-600">Search by name or medical specialization</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search doctor name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none"
        />
        <input
          type="text"
          placeholder="Specialization (e.g. Cardiology, Pediatrics)..."
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition shadow-xs"
        >
          Search
        </button>
      </form>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner message="Searching available doctors..." />
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          <span className="text-4xl">🔍</span>
          <h3 className="mt-3 text-lg font-bold text-gray-900">No doctors found</h3>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search query or clear filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Dr. {doc.name}</h3>
                    <span className="inline-block mt-1 px-3 py-1 bg-indigo-50 text-indigo-700 font-medium text-xs rounded-full">
                      {doc.specialization}
                    </span>
                  </div>
                  <span className="text-3xl">👨‍⚕️</span>
                </div>

                <div className="mt-4 text-xs text-gray-600 space-y-1.5 pt-3 border-t border-gray-100">
                  <p><strong>Slot Duration:</strong> {doc.slotDuration} mins</p>
                  <p><strong>Leave Dates:</strong> {doc.leaveDates && doc.leaveDates.length > 0 ? doc.leaveDates.join(', ') : 'None scheduled'}</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/patient/doctors/${doc.id}`}
                  className="block w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-xs"
                >
                  View Details & Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
          >
            ← Previous
          </button>
          <span className="text-xs font-medium text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;
