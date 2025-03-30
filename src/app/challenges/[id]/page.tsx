'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, deleteDoc, Timestamp, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import ChallengeTypeIcon from '@/components/icons/ChallengeTypeIcon';
import React from 'react';
import { createActivity } from '@/services/activityService';
import { isAdmin, canModifyItem } from '@/utils/adminUtils';
import RatingStars from '@/components/challenges/RatingStars';
import { rateChallenge, getUserChallengeRating, getChallengeRatings } from '@/services/challengeService';
import UserSearchDialog from '@/components/challenges/UserSearchDialog';

type Challenge = {
  id: string;
  title: string;
  description: string;
  type: 'interpersonal' | 'social' | 'life' | 'physical';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  steps?: string[];
  tips?: string[];
  createdAt?: Date;
  createdBy?: string;
  participants?: string[];
  category?: string;
  ratings?: Record<string, number>;
  feedback?: string[];
};

export default function ChallengeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Use React.use() to unwrap the params Promise as required by Next.js 15.1.7
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [creatorName, setCreatorName] = useState<string>('Unknown');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [cooldownInterval, setCooldownInterval] = useState<NodeJS.Timeout | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);

  // Fetch challenge details
  useEffect(() => {
    const fetchChallenge = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setChallenge(null); // Reset challenge state before fetching

        console.log('Fetching challenge data for ID:', id);
        const challengeDoc = await getDoc(doc(db, 'challenges', id));
        
        if (!challengeDoc.exists()) {
          setError('Challenge not found');
          setIsLoading(false);
          return;
        }

        const challengeData = challengeDoc.data() as Omit<Challenge, 'id'>;
        console.log('Fetched challenge data:', challengeData);
        
        // Map legacy challenge types to new types
        const typeMapping: Record<string, string> = {
          'emotional': 'social',
          'physical': 'social',
          'mental': 'social'
        };
        
        const normalizedType = typeMapping[challengeData.type] || challengeData.type || 'social';
        console.log('Normalized challenge type:', normalizedType);
        
        // Create challenge object
        const challenge: Challenge = {
          id,
          title: challengeData.title || '',
          description: challengeData.description || '',
          type: normalizedType as 'interpersonal' | 'social' | 'life' | 'physical',
          difficulty: normalizeDifficulty(challengeData.difficulty),
          duration: challengeData.duration || '1 day',
          category: challengeData.category || '',
          createdBy: challengeData.createdBy || '',
          createdAt: challengeData.createdAt?.toDate() || new Date(),
          steps: challengeData.steps || [],
          tips: challengeData.tips || [],
          participants: challengeData.participants || [],
          ratings: challengeData.ratings || {},
          feedback: challengeData.feedback || [],
        };
        
        console.log('Final challenge object with type:', challenge.type);
        console.log('Challenge difficulty:', challenge.difficulty);
        setChallenge(challenge);
        
        // Check if user has already joined this challenge
        if (challenge.participants && challenge.participants.includes(user.uid) && challenge.createdBy !== user.uid) {
          setHasJoined(true);
        } else {
          setHasJoined(false);
        }

        // Fetch creator name if available
        if (challenge.createdBy) {
          try {
            const userDoc = await getDoc(doc(db, 'users', challenge.createdBy));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setCreatorName(userData.displayName || 'Unknown');
            }
          } catch (error) {
            console.error('Error fetching creator name:', error);
          }
        }
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load challenge details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
    
    // Add a cleanup function to reset state when component unmounts or id changes
    return () => {
      setChallenge(null);
      setHasJoined(false);
      setShowSuccessMessage(false);
      setError(null);
    };
  }, [id, router, user, authLoading]); // Add router to dependencies to ensure refresh on navigation

  // Check if user has recently started this challenge
  useEffect(() => {
    const checkRecentActivity = async () => {
      if (!user || !challenge || isAdmin(user)) return;

      try {
        // Query for recent activities by this user for this challenge
        const activitiesRef = collection(db, 'activities');
        const tenMinutesAgo = new Date();
        tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
        
        const recentActivitiesQuery = query(
          activitiesRef,
          where('userId', '==', user.uid),
          where('challengeId', '==', id),
          where('type', '==', 'started'),
          where('timestamp', '>=', Timestamp.fromDate(tenMinutesAgo)),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        
        const activitiesSnapshot = await getDocs(recentActivitiesQuery);
        
        if (!activitiesSnapshot.empty) {
          // User has recently started this challenge
          const mostRecentActivity = activitiesSnapshot.docs[0].data();
          const activityTimestamp = mostRecentActivity.timestamp.toDate();
          const cooldownEndTime = new Date(activityTimestamp);
          cooldownEndTime.setMinutes(cooldownEndTime.getMinutes() + 10);
          
          const timeLeftMs = cooldownEndTime.getTime() - new Date().getTime();
          if (timeLeftMs > 0) {
            // Cooldown is still active
            setCooldownActive(true);
            setCooldownTimeLeft(Math.ceil(timeLeftMs / 1000));
            
            // Set up interval to update countdown
            const interval = setInterval(() => {
              setCooldownTimeLeft(prev => {
                const newValue = prev - 1;
                if (newValue <= 0) {
                  setCooldownActive(false);
                  if (cooldownInterval) clearInterval(cooldownInterval);
                  return 0;
                }
                return newValue;
              });
            }, 1000);
            
            setCooldownInterval(interval);
          }
        }
      } catch (err) {
        console.error('Error checking recent activities:', err);
      }
    };
    
    checkRecentActivity();
    
    // Clean up interval on unmount
    return () => {
      if (cooldownInterval) {
        clearInterval(cooldownInterval);
      }
    };
  }, [user, challenge, id, cooldownInterval]);

  // Fetch user's rating for this challenge
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user || !id) return;
      
      try {
        const rating = await getUserChallengeRating(user.uid, id);
        if (rating) {
          setUserRating(rating.rating);
          setRatingFeedback(rating.feedback || '');
        }
      } catch (err) {
        console.error('Error fetching user rating:', err);
      }
    };
    
    fetchUserRating();
  }, [user, id]);

  // Handle joining a challenge
  const handleJoinChallenge = async () => {
    if (!user || !challenge) return;
    
    // Check if user is on cooldown (unless they're an admin)
    if (cooldownActive && !isAdmin(user)) {
      setError(`You must wait ${cooldownTimeLeft} seconds before starting this dare again.`);
      return;
    }
    
    setIsJoining(true);
    setError(null);
    
    try {
      // Create activity record
      await createActivity({
        userId: user.uid,
        challengeId: id,
        challengeTitle: challenge.title,
        challengeType: challenge.type,
        type: 'started',
        status: 'in_progress',
        timestamp: new Date(),
      });
      
      // Update challenge participants array if user is not already in it
      if (!challenge.participants?.includes(user.uid)) {
        await updateDoc(doc(db, 'challenges', id), {
          participants: arrayUnion(user.uid)
        });
      }
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      // Set user as having joined
      setHasJoined(true);
      
      // Activate cooldown for non-admin users
      if (!isAdmin(user)) {
        setCooldownActive(true);
        setCooldownTimeLeft(10 * 60); // 10 minutes in seconds
        
        const interval = setInterval(() => {
          setCooldownTimeLeft(prev => {
            const newValue = prev - 1;
            if (newValue <= 0) {
              setCooldownActive(false);
              if (cooldownInterval) clearInterval(cooldownInterval);
              return 0;
            }
            return newValue;
          });
        }, 1000);
        
        setCooldownInterval(interval);
      }
      
    } catch (err) {
      console.error('Error joining challenge:', err);
      setError('Failed to start the dare. Please try again later.');
    } finally {
      setIsJoining(false);
    }
  };
  
  // Normalize difficulty value
  function normalizeDifficulty(difficulty: string | undefined): Challenge['difficulty'] {
    if (!difficulty) return 'Beginner';
    
    const validDifficulties: Challenge['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced'];
    
    // Check if the difficulty is already in a valid format
    if (validDifficulties.includes(difficulty as Challenge['difficulty'])) {
      return difficulty as Challenge['difficulty'];
    }
    
    // Capitalize first letter
    const normalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    
    // Return matching difficulty or default to 'Beginner'
    if (validDifficulties.includes(normalizedDifficulty as Challenge['difficulty'])) {
      return normalizedDifficulty as Challenge['difficulty'];
    }
    
    return 'Beginner';
  }
  
  // Format cooldown time
  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handle challenge deletion
  const handleDeleteChallenge = async () => {
    if (!user || !challenge) return;
    
    setIsDeleting(true);
    
    try {
      await deleteDoc(doc(db, 'challenges', id));
      
      // Navigate back to challenges list
      router.push('/challenges');
    } catch (err) {
      console.error('Error deleting challenge:', err);
      setError('Failed to delete challenge. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle rating change
  const handleRatingChange = (newRating: number) => {
    setUserRating(newRating);
    
    // Show feedback form if rating is set to a value
    if (newRating > 0) {
      setShowRatingForm(true);
    } else {
      setShowRatingForm(false);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !challenge || userRating === null) return;
    
    setIsSubmittingRating(true);
    
    try {
      await rateChallenge(user.uid, id, userRating, ratingFeedback);
      
      // Show success message and hide form
      setShowRatingSuccess(true);
      setShowRatingForm(false);
      
      setTimeout(() => {
        setShowRatingSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Handle challenge with participant
  const handleChallengeWithParticipant = (participantId: string) => {
    if (!user || !challenge) return;
    
    console.log('Creating a challenge with participant:', participantId);
    
    // Add logic to create a challenge with the selected participant
    // This might involve creating a group or sending a notification
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="neu-card p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Challenge Not Found</h2>
          <p className="text-gray-600 mb-4">The challenge you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/challenges')}
            className="neu-button px-4 py-2 text-primary font-medium"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/challenges')}
          className="flex items-center neu-button px-3 py-2 text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <div className="flex space-x-2">
          {/* Challenge With User Button */}
          {user && user.uid !== challenge.createdBy && (
            <button
              onClick={() => setShowChallengeDialog(true)}
              className="flex items-center neu-button px-3 py-2 text-primary"
              aria-label="Challenge a friend"
              title="Challenge a friend to this dare"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Challenge Friend
            </button>
          )}
          
          {/* Edit Button for challenge creators or admins */}
          {user && (challenge.createdBy === user.uid || isAdmin(user)) && (
            <button
              onClick={() => router.push(`/challenges/edit/${id}`)}
              className="flex items-center neu-button px-3 py-2 text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          
          {/* Delete Button for challenge creators or admins */}
          {user && (challenge.createdBy === user.uid || isAdmin(user)) && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center neu-button px-3 py-2 text-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Dare Card */}
      <div className="neu-card mb-8">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-full neu-element-small mr-4">
            <ChallengeTypeIcon type={challenge.type} className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{challenge.title}</h1>
            <div className="flex flex-col mt-1">
              {/* Creator Name */}
              {challenge.createdBy && (
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Created by{" "}
                  <span
                    className="text-primary dark:text-primary hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/profile?userId=${challenge.createdBy}`);
                    }}
                  >
                    {creatorName}
                  </span>
                </span>
              )}

              {/* Dare Info Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                  {/* Type Badge */}
                  <span className="flex items-center text-sm text-gray-600 dark:text-gray-300 neu-element-small px-2 py-0.5 rounded-full">
                    <ChallengeTypeIcon type={challenge.type} className="w-4 h-4 mr-1.5 text-primary" />
                    <span className="capitalize font-medium">{challenge.type}</span>
                  </span>
                  {/* Difficulty Badge */}
                 {challenge.difficulty && (
                  <span className="text-sm text-gray-600 dark:text-gray-300 neu-element-small px-2 py-0.5 rounded-full">
                    Difficulty: <span className="font-medium ml-1">{challenge.difficulty}</span>
                  </span>
                 )}
                 {/* Duration Badge */}
                 {challenge.duration && (
                  <span className="text-sm text-gray-600 dark:text-gray-300 neu-element-small px-2 py-0.5 rounded-full">
                    Duration: <span className="font-medium ml-1">{challenge.duration}</span>
                  </span>
                 )}
                 {/* Category Badge (if exists) */}
                 {challenge.category && (
                  <span className="text-sm text-gray-600 dark:text-gray-300 neu-element-small px-2 py-0.5 rounded-full">
                    Category: <span className="font-medium ml-1 capitalize">{challenge.category}</span>
                  </span>
                 )}
              </div>

              {/* Integrated Rating Section */}
              {user && (
                <div className="mt-3 flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Rate:</span>
                  <RatingStars 
                    initialRating={userRating || 0} 
                    onRatingChange={handleRatingChange}
                    size="sm"
                  />
                  
                  {showRatingSuccess && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      Thanks for rating!
                    </span>
                  )}
                </div>
              )}
              
              {/* Compact Feedback Form */}
              {showRatingForm && (
                <div className="mt-2">
                  <form onSubmit={handleRatingSubmit} className="flex flex-col">
                    <textarea
                      id="feedback"
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Share your thoughts (optional)..."
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingRating}
                      className="self-end mt-1 px-3 py-1 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {isSubmittingRating ? 'Submitting...' : 'Submit'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="neu-inset p-5 rounded-xl mb-6">
          <h2 className="text-base font-semibold mb-2 text-gray-600 dark:text-gray-300">Description</h2>
          <p className="text-gray-600 dark:text-gray-200 whitespace-pre-line">{challenge.description}</p>
        </div>

        {challenge.steps && challenge.steps.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Steps to Complete This Dare</h2>
            <div className="space-y-3">
              {challenge.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="neu-element-small w-8 h-8 flex items-center justify-center rounded-full mr-3 flex-shrink-0">
                    <span className="text-primary font-medium">{index + 1}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {challenge.tips && challenge.tips.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Tips</h2>
            <div className="neu-inset p-4 rounded-xl">
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-200">
                {challenge.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-center transition-opacity duration-300">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You've started this dare!
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-center transition-opacity duration-300">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {/* Start Challenge Button with Cooldown */}
          <button
            onClick={handleJoinChallenge}
            disabled={isJoining || (cooldownActive && !isAdmin(user))}
            className={`w-full neu-button py-4 bg-primary text-white font-medium transition-all ${
              cooldownActive && !isAdmin(user) 
                ? 'opacity-40 cursor-not-allowed' 
                : 'hover:bg-primary-dark'
            }`}
          >
            {isJoining ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Dare...
              </span>
            ) : (
              challenge?.createdBy === user?.uid && !hasJoined 
                ? 'Start Your Dare' 
                : (hasJoined ? 'Start Dare Again' : 'Start This Dare')
            )}
          </button>
          
          {/* Show View Progress button if user has joined */}
          {hasJoined && (
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/profile?tab=activity')}
                className="neu-button py-2 px-6 text-primary font-medium"
              >
                View My Progress
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="neu-card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Dare</h3>
            <p className="text-gray-600 dark:text-gray-200 mb-6">
              Are you sure you want to delete this dare? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="neu-button py-2 px-4 text-gray-600 dark:text-gray-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChallenge}
                className="neu-button py-2 px-4 bg-red-600 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* User Search Dialog for Challenge With */}
      {showChallengeDialog && (
        <UserSearchDialog
          onClose={() => setShowChallengeDialog(false)}
          onSelect={handleChallengeWithParticipant}
          title="Challenge a Friend"
          description="Select a friend to challenge with this dare:"
        />
      )}
      
      {/* Cooldown Indicator */}
      {cooldownActive && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg flex items-center space-x-2 z-40 border border-gray-200 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cooldown Period</p>
            <p className="text-sm font-medium">{formatCooldownTime(cooldownTimeLeft)}</p>
          </div>
        </div>
      )}
    </div>
  );
}