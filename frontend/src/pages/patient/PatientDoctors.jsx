import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { Search, Stethoscope, Clock, CalendarX, ArrowRight, Star, Sparkles, Filter } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Specialist Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Find & Book Specialist Doctors</h1>
          <p className="text-sm text-slate-400">Select a specialist physician to reserve consultation slots</p>
        </div>
      </div>

      {/* Glassmorphic Search & Filter Bar */}
      <form onSubmit={handleSearch} className="glass-card p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search doctor by name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="relative flex-1">
          <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Specialization (e.g. Cardiology, Pediatrics)..."
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg teal-glow flex items-center justify-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </form>

      <AlertMessage type="error" message={error} onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner message="Querying PulseCare medical directory..." />
      ) : doctors.length === 0 ? (
        <div className="glass-card rounded-3xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
          <Search className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No doctors matched your query</h3>
          <p className="text-sm text-slate-400">Try adjusting your search criteria or clear the specialization filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => {
            const doctorId = doc.id || doc._id;
            return (
              <div key={doctorId} className="glass-card glass-card-hover rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500/20 via-cyan-500/20 to-teal-400/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-lg shadow-inner">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Dr. {doc.name}</h3>
                        <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold text-xs rounded-md">
                          {doc.specialization}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-amber-400 pt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-slate-400 font-medium ml-1">5.0 (48 reviews)</span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>Slot Duration:</span>
                      </span>
                      <span className="font-semibold text-slate-200">{doc.slotDuration} minutes</span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-slate-500 flex items-center space-x-1">
                        <CalendarX className="w-3.5 h-3.5 text-amber-400" />
                        <span>Scheduled Leave:</span>
                      </span>
                      <span className="font-medium text-slate-300 text-right">
                        {doc.leaveDates && doc.leaveDates.length > 0 ? doc.leaveDates.join(', ') : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <Link
                    to={`/patient/doctors/${doctorId}`}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition shadow-md teal-glow"
                  >
                    <span>Book Consultation Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            ← Previous
          </button>
          <span className="text-xs font-medium text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;
