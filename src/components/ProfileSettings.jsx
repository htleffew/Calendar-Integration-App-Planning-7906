import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiEdit3, FiSave, FiLink, FiCopy, FiCheck } = FiIcons;

function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    title: '',
    bio: '',
    username: '',
    avatar_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setLoading(false);
          return;
        }

        setUser(user);

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles_sched2025')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || '',
            title: profileData.title || '',
            bio: profileData.bio || '',
            username: profileData.username || '',
            avatar_url: profileData.avatar_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    try {
      if (!user) throw new Error('User not authenticated');

      // Check username availability if it was changed
      if (profile.username) {
        const { data: existingUsers, error: usernameCheckError } = await supabase
          .from('user_profiles_sched2025')
          .select('username')
          .eq('username', profile.username)
          .neq('user_id', user.id);

        if (usernameCheckError) throw usernameCheckError;

        if (existingUsers && existingUsers.length > 0) {
          setError('Username is already taken');
          setSaveLoading(false);
          return;
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles_sched2025')
        .update({
          full_name: profile.full_name,
          title: profile.title,
          bio: profile.bio,
          username: profile.username,
          avatar_url: profile.avatar_url,
          updated_at: new Date()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const copyScheduleLink = () => {
    if (!profile.username) return;
    const link = `${window.location.origin}/schedule/${profile.username}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SafeIcon icon={FiEdit3} className="w-4 h-4" />
            <span>Edit Profile</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </motion.button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Profile Image */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <SafeIcon icon={FiUser} className="w-8 h-8 text-blue-600" />
              )}
            </div>
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image URL
                </label>
                <input
                  type="text"
                  name="avatar_url"
                  value={profile.avatar_url || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL to an image (JPG, PNG)
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.full_name}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  required
                  pattern="^[a-z0-9_-]+$"
                  title="Username can only contain lowercase letters, numbers, underscores and hyphens"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">@{profile.username}</p>
                  <button
                    type="button"
                    onClick={copyScheduleLink}
                    className="text-blue-600 hover:text-blue-800"
                    title="Copy scheduling link"
                  >
                    <SafeIcon icon={copied ? FiCheck : FiCopy} className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={profile.title || ''}
                  onChange={handleChange}
                  placeholder="e.g., Product Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.title || '–'}</p>
              )}
            </div>

            {/* Scheduling Link */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduling Link
                </label>
                <div className="flex items-center space-x-2">
                  <div className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg flex-1 truncate">
                    {`${window.location.origin}/schedule/${profile.username}`}
                  </div>
                  <button
                    type="button"
                    onClick={copyScheduleLink}
                    className={`p-2 ${
                      copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    } rounded-lg hover:bg-gray-200`}
                    title="Copy scheduling link"
                  >
                    <SafeIcon icon={copied ? FiCheck : FiCopy} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                rows="4"
                placeholder="Tell people a bit about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-line">{profile.bio || '–'}</p>
            )}
          </div>

          {/* Public Page Preview */}
          {!isEditing && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiLink} className="w-4 h-4 text-blue-600" />
                <a
                  href={`/schedule/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View your public booking page
                </a>
              </div>
            </div>
          )}

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={saveLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProfileSettings;