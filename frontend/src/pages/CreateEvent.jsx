/**
 * Create Event Page (Admin Only)
 * Form to create new events
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: '',
    rules: '',
    teamSizeMin: 1,
    teamSizeMax: 6,
    registrationClose: '',
    eventStart: '',
    eventEnd: ''
  });
  const [brochureFile, setBrochureFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload only PDF, JPEG, or PNG files');
        e.target.value = ''; // Clear the input
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      setBrochureFile(file);
      setError(''); // Clear any previous error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add basic event data
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('categories', formData.categories);
      submitData.append('rules', formData.rules);
      submitData.append('teamSizeMin', formData.teamSizeMin);
      submitData.append('teamSizeMax', formData.teamSizeMax);
      
      // Add deadlines if provided
      if (formData.registrationClose) {
        submitData.append('registrationClose', formData.registrationClose);
      }
      if (formData.eventStart) {
        submitData.append('eventStart', formData.eventStart);
      }
      if (formData.eventEnd) {
        submitData.append('eventEnd', formData.eventEnd);
      }
      
      // Add brochure file if selected
      if (brochureFile) {
        submitData.append('brochure', brochureFile);
      }

      const response = await api.post('/events', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert('Event created successfully!');
      navigate(`/events/${response.data.event._id}`);
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Event</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., Smart India Hackathon 2024"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              className="input-field"
              placeholder="Describe the event..."
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories * (comma-separated)
            </label>
            <input
              type="text"
              name="categories"
              value={formData.categories}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., Hackathon, Innovation, Technology"
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules (one per line)
            </label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows="5"
              className="input-field"
              placeholder="Each line will be a separate rule"
            />
          </div>

          {/* Team size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Team Size *
              </label>
              <input
                type="number"
                name="teamSizeMin"
                value={formData.teamSizeMin}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Team Size *
              </label>
              <input
                type="number"
                name="teamSizeMax"
                value={formData.teamSizeMax}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
              />
            </div>
          </div>

          {/* Deadlines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Close
              </label>
              <input
                type="date"
                name="registrationClose"
                value={formData.registrationClose}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Start
              </label>
              <input
                type="date"
                name="eventStart"
                value={formData.eventStart}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event End
              </label>
              <input
                type="date"
                name="eventEnd"
                value={formData.eventEnd}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Brochure Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Brochure (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-medium
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100
                          cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload PDF, JPEG, or PNG files (max 5MB)
              </p>
              {brochureFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Selected: {brochureFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
