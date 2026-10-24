import React, { useState, useEffect, useRef } from 'react';
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
  const initialAchievementsRef = useRef([]);
  const [achievementLoadError, setAchievementLoadError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const stagedAvatarPath = useRef(null);

  useEffect(() => () => {
    const path = stagedAvatarPath.current;
    if (path) supabase.storage.from('avatars').remove([path]);
  }, []);

  const getOwnedAvatarPath = (url) => {
    if (!url || !session?.user?.id) return null;
    const marker = '/storage/v1/object/public/avatars/';
    const markerIndex = url.indexOf(marker);
    if (markerIndex < 0) return null;
    try {
      const path = decodeURIComponent(url.slice(markerIndex + marker.length).split('?')[0]);
      return path.startsWith(`${session.user.id}/`) ? path : null;
    } catch { return null; }
  };

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (!contextProfile) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setAchievementLoadError('');
      setName(contextProfile.name || '');
      setTitle(contextProfile.title || '');
      setDesiredRole(contextProfile.desired_role || '');
      setDepartment(contextProfile.department || '');
      setExperience(contextProfile.experience || '');
      setLocation(contextProfile.location || '');
      setCareerGoals(contextProfile.career_goals || '');
      setAvatarUrl(contextProfile.avatar_url || '');

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', contextProfile.id);
      if (!active) return;
      if (error) {
        initialAchievementsRef.current = [];
        setAchievements([]);
        setAchievementLoadError(`We couldn’t load your saved achievements, so saving is paused to protect them: ${error.message}`);
      } else {
        const loadedAchievements = data || [];
        initialAchievementsRef.current = loadedAchievements;
        setAchievements(loadedAchievements);
      }
      setLoading(false);
    };
    loadProfile().catch((error) => {
      if (!active) return;
      setAchievementLoadError(`We couldn’t load your saved achievements, so saving is paused to protect them: ${error.message || 'connection unavailable'}`);
      setLoading(false);
    });
    return () => { active = false; };
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
      const previousStagedPath = stagedAvatarPath.current;
      stagedAvatarPath.current = fileName;
      if (previousStagedPath) await supabase.storage.from('avatars').remove([previousStagedPath]);
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (achievementLoadError) return;
    setLoading(true);
    setSaveError('');
    setSaveSuccess('');
    const newlyUploadedAvatarPath = stagedAvatarPath.current;

    const { error: profileError } = await supabase
      .from('users')
      .update({ name, title, desired_role: desiredRole, department, experience, location, career_goals: careerGoals, avatar_url: avatarUrl })
      .eq('id', session.user.id);

    if (profileError) {
      setSaveError(`Could not save your profile: ${profileError.message}`);
      setLoading(false);
      return;
    }
    // The profile now points to the uploaded object; it is no longer an unsaved temporary upload.
    stagedAvatarPath.current = null;

    const originalAchievements = initialAchievementsRef.current;
    const originalIds = new Set(originalAchievements.map((item) => item.id).filter(Boolean));
    const achievementsToKeep = achievements.filter((item) => item.title.trim());
    const originalById = new Map(originalAchievements.filter((item) => item.id).map((item) => [item.id, item]));
    const unchangedAchievements = [];
    const achievementsToInsert = [];
    achievementsToKeep.forEach((item) => {
      const original = originalById.get(item.id);
      const title = item.title.trim();
      const subtitle = (item.subtitle || '').trim();
      if (!original || original.title?.trim() !== title || (original.subtitle || '').trim() !== subtitle) {
        achievementsToInsert.push({ user_id: session.user.id, title, subtitle });
      } else {
        unchangedAchievements.push(item);
      }
    });

    // Insert additions/edits before removing old rows, so a failed insert never erases the saved version.
    const { data: insertedAchievements, error: insertAchievementsError } = achievementsToInsert.length
      ? await supabase.from('achievements').insert(achievementsToInsert).select('*')
      : { data: [], error: null };

    if (insertAchievementsError) {
      setSaveError(`Your profile details were saved, but achievements could not be updated. Your previous achievements are still intact: ${insertAchievementsError.message}`);
      setLoading(false);
      return;
    }

    const savedAchievements = [...unchangedAchievements, ...(insertedAchievements || [])];
    setAchievements(savedAchievements);
    const savedIds = new Set(savedAchievements.map((item) => item.id).filter(Boolean));
    const explicitlyRemovedIds = [...originalIds].filter((id) => !savedIds.has(id));
    const { error: deleteRemovedError } = explicitlyRemovedIds.length
      ? await supabase.from('achievements').delete().eq('user_id', session.user.id).in('id', explicitlyRemovedIds)
      : { error: null };
    if (deleteRemovedError) {
      const stillPendingDelete = originalAchievements.filter((item) => explicitlyRemovedIds.includes(item.id));
      initialAchievementsRef.current = [...savedAchievements, ...stillPendingDelete];
      setSaveError(`Your profile and achievement edits were saved, but one removed achievement could not be deleted: ${deleteRemovedError.message}`);
      setLoading(false);
      return;
    }

    const previousAvatarPath = getOwnedAvatarPath(contextProfile?.avatar_url);
    let photoCleanupFailed = false;
    if (previousAvatarPath && previousAvatarPath !== newlyUploadedAvatarPath && avatarUrl !== contextProfile?.avatar_url) {
      const { error: cleanupError } = await supabase.storage.from('avatars').remove([previousAvatarPath]);
      if (cleanupError) {
        photoCleanupFailed = true;
        console.warn('Profile photo was updated, but the old image could not be removed.', cleanupError);
      }
    }

    // Keep the ref in sync after a successful save; no full-table delete/reinsert is used.
    initialAchievementsRef.current = savedAchievements;
    await refetchProfile();
    setLoading(false);
    setSaveSuccess('Your profile has been saved.');
    navigate('/profile', { state: { profileSaved: true, photoCleanupFailed } });
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
              <p className="avatar-privacy-note">Profile photos are publicly viewable by anyone with the image URL.</p>
              <input type="file" id="avatar-upload" onChange={handleAvatarUpload} disabled={uploading || loading} accept="image/jpeg,image/png,image/webp" />
              <label htmlFor="avatar-upload" className="upload-label">{uploading ? 'Uploading…' : avatarUrl ? 'Choose a different photo' : 'Choose your photo'}</label>
              {photoError && <p className="edit-profile-error" role="alert">{photoError}</p>}
            </div>
          </div>
        </Card>
        <Card>
          <h3>Career snapshot</h3>
          <p className="edit-section-description">Keep your present experience and next role distinct so your roadmap can focus on the right gap.</p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="profile-name">Name</label>
              <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-current-role">Current role</label>
              <input id="profile-current-role" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-desired-role">Desired role</label>
              <input id="profile-desired-role" type="text" value={desiredRole} onChange={(e) => setDesiredRole(e.target.value)} placeholder="The role you are working toward" />
            </div>
            <div className="form-group">
              <label htmlFor="profile-department">Education or team</label>
              <input id="profile-department" type="text" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-experience">Experience</label>
              <input id="profile-experience" type="text" value={experience} onChange={(e) => setExperience(e.target.value)} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="profile-location">Location</label>
              <input id="profile-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
        </Card>
        <Card>
          <h3>Career focus &amp; goals</h3>
          <p className="edit-section-description">Write a practical outcome you can work toward. Include a target, a proof point, and a timeframe when you can.</p>
          <div className="form-group">
            <label htmlFor="career-goals">Your next career milestone</label>
            <textarea id="career-goals" value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} rows="4" placeholder="Example: Move into a junior data analyst role this year by building two SQL and Power BI projects and sharing them in a portfolio." />
          </div>
        </Card>
        <Card>
          <h3>Recent achievements</h3>
          <p className="edit-section-description">Show the work and results behind your skills. Projects, certifications, launches, and measurable improvements all count.</p>
          {achievementLoadError && <p className="edit-profile-error" role="alert">{achievementLoadError}</p>}
          {achievements.length === 0 && <p className="achievement-empty-state">No achievements added yet. Start with a project or milestone you can explain in an interview.</p>}
          {achievements.map((ach, index) => (
            <div key={index} className="achievement-edit-item">
              <div className="achievement-input-group"><label htmlFor={`achievement-title-${index}`}>Project or achievement</label><input id={`achievement-title-${index}`} type="text" placeholder="e.g. Customer churn dashboard" value={ach.title} onChange={(e) => handleAchievementChange(index, 'title', e.target.value)} /></div>
              <div className="achievement-input-group"><label htmlFor={`achievement-result-${index}`}>Result or evidence</label><input id={`achievement-result-${index}`} type="text" placeholder="e.g. Built with SQL and Power BI; surfaced 3 retention trends" value={ach.subtitle} onChange={(e) => handleAchievementChange(index, 'subtitle', e.target.value)} /></div>
              <button type="button" className="remove-button" onClick={() => removeAchievement(index)} aria-label={`Remove achievement ${index + 1}`}>&times;</button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addAchievement}>+ Add a project or achievement</Button>
        </Card>
        {saveError && <p className="edit-profile-error" role="alert">{saveError}</p>}
        {saveSuccess && <p className="edit-profile-success" role="status">{saveSuccess}</p>}
        <Button type="submit" disabled={loading || uploading || Boolean(achievementLoadError)}>{loading ? 'Saving…' : uploading ? 'Uploading photo…' : achievementLoadError ? 'Saving paused until achievements load' : 'Save all changes'}</Button>
      </form>
    </div>
  );
};

export default EditProfilePage;
