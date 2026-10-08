import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../contexts/UserContext'; // Ensure this hook provides refetchProfile
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './EditProfilePage.css';

const EditProfilePage = () => {
  // Make sure refetchProfile is included here
  const { session, profile: contextProfile, refetchProfile } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [desiredRole, setDesiredRole] = useState('');
  const [department, setDepartment] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (contextProfile) {
      setName(contextProfile.name || '');
      setTitle(contextProfile.title || '');
      setDesiredRole(contextProfile.desired_role || '');
      setDepartment(contextProfile.department || '');
      setExperience(contextProfile.experience || '');
      setLocation(contextProfile.location || '');
      setCareerGoals(contextProfile.career_goals || '');
      setAvatarUrl(contextProfile.avatar_url || '');

      const getAchievements = async () => {
        const { data } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', contextProfile.id);
        if (data) setAchievements(data);
      };
      
      getAchievements();
    }
    setLoading(false);
  }, [contextProfile]);

  const handleAchievementChange = (index, field, value) => {
    const updatedAchievements = [...achievements];
    updatedAchievements[index][field] = value;
    setAchievements(updatedAchievements);
  };
  const addAchievement = () => {
    setAchievements([...achievements, { title: '', subtitle: '' }]);
  };
  const removeAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPhotoError('');
    setSaveError('');
    setSaveSuccess('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Your photo must be smaller than 5 MB.');
      return;
    }

    setUploading(true);
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const fileName = `${session.user.id}/profile-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { contentType: file.type, cacheControl: '3600' });
    
    if (uploadError) {
      setPhotoError(`Could not upload this photo: ${uploadError.message}`);
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSaveError('');
    setSaveSuccess('');

    const { error: profileError } = await supabase
      .from('users')
      .update({ name, title, desired_role: desiredRole, department, experience, location, career_goals: careerGoals, avatar_url: avatarUrl })
      .eq('id', session.user.id);

    if (profileError) {
      setSaveError(`Could not save your profile: ${profileError.message}`);
      setLoading(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from('achievements')
      .delete()
      .eq('user_id', session.user.id);

    const achievementsToInsert = achievements
      .filter(a => a.title)
      .map(a => ({ user_id: session.user.id, title: a.title, subtitle: a.subtitle }));
    
    const { error: achievementsError } = deleteError
      ? { error: null }
      : achievementsToInsert.length
        ? await supabase.from('achievements').insert(achievementsToInsert)
        : { error: null };

    if (deleteError || achievementsError) {
      setSaveError(`Your profile photo and details were saved, but achievements could not be updated: ${(deleteError || achievementsError).message}`);
      setLoading(false);
    } else {
      await refetchProfile(); 
      setLoading(false);
      setSaveSuccess('Your profile has been saved.');
      navigate('/profile', { state: { profileSaved: true } });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="edit-profile-page">
      <header className="edit-profile-heading">
        <p className="profile-eyebrow">YOUR PATHFINDER SPACE</p>
        <h1>Edit your profile</h1>
        <p>Update your photo, career details, and the milestones you want to keep.</p>
      </header>
      <form onSubmit={handleSave}>
        <Card>
          <h3>Profile photo</h3>
          <div className="avatar-upload-section">
            {avatarUrl ? <img src={avatarUrl} alt="Your profile" className="edit-avatar" /> : <div className="edit-avatar-empty" aria-label="No profile photo added"><span aria-hidden="true">+</span></div>}
            <div className="avatar-upload-copy">
              <b>{avatarUrl ? 'Your photo' : 'Add a photo of yourself'}</b>
              <p>JPG, PNG, or WebP · up to 5 MB</p>
              <input type="file" id="avatar-upload" onChange={handleAvatarUpload} disabled={uploading || loading} accept="image/jpeg,image/png,image/webp" />
              <label htmlFor="avatar-upload" className="upload-label">{uploading ? 'Uploading…' : avatarUrl ? 'Choose a different photo' : 'Choose your photo'}</label>
              {photoError && <p className="edit-profile-error" role="alert">{photoError}</p>}
            </div>
          </div>
        </Card>
        <Card>
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Current role</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Desired role</label>
              <input type="text" value={desiredRole} onChange={(e) => setDesiredRole(e.target.value)} placeholder="The role you are working toward" />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Experience</label>
              <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} />
            </div>
            <div className="form-group full-width">
              <label>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
        </Card>
        <Card>
          <h3>Career Goals</h3>
          <div className="form-group">
            <textarea value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} rows="4" />
          </div>
        </Card>
        <Card>
          <h3>Recent Achievements</h3>
          {achievements.map((ach, index) => (
            <div key={index} className="achievement-edit-item">
              <input type="text" placeholder="Achievement Title" value={ach.title} onChange={(e) => handleAchievementChange(index, 'title', e.target.value)} />
              <input type="text" placeholder="Subtitle or Description" value={ach.subtitle} onChange={(e) => handleAchievementChange(index, 'subtitle', e.target.value)} />
              <button type="button" className="remove-button" onClick={() => removeAchievement(index)}>&times;</button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addAchievement}>+ Add Achievement</Button>
        </Card>
        {saveError && <p className="edit-profile-error" role="alert">{saveError}</p>}
        {saveSuccess && <p className="edit-profile-success" role="status">{saveSuccess}</p>}
        <Button type="submit" disabled={loading || uploading}>{loading ? 'Saving…' : uploading ? 'Uploading photo…' : 'Save all changes'}</Button>
      </form>
    </div>
  );
};

export default EditProfilePage;
