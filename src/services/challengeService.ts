import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

type Rating = {
  userId: string;
  challengeId: string;
  rating: number;
  feedback?: string;
  timestamp: Date;
};

/**
 * Rates a challenge by a user
 * @param userId The ID of the user submitting the rating
 * @param challengeId The ID of the challenge being rated
 * @param rating The rating value (typically 1-5)
 * @param feedback Optional feedback text
 * @returns A promise that resolves when the rating is saved
 */
export const rateChallenge = async (
  userId: string,
  challengeId: string,
  rating: number,
  feedback?: string
): Promise<void> => {
  try {
    // Create or update the rating document
    const ratingRef = doc(db, 'challenge_ratings', `${userId}_${challengeId}`);
    const ratingData: Rating = {
      userId,
      challengeId,
      rating,
      feedback,
      timestamp: new Date()
    };
    
    await setDoc(ratingRef, ratingData);
    
    // Also update the challenge document with the new rating
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);
    
    if (challengeDoc.exists()) {
      const challengeData = challengeDoc.data();
      const ratings = challengeData.ratings || {};
      ratings[userId] = rating;
      
      await updateDoc(challengeRef, { ratings });
    }
  } catch (error) {
    console.error('Error rating challenge:', error);
    throw new Error('Failed to submit rating');
  }
};

/**
 * Gets a user's rating for a specific challenge
 * @param userId The ID of the user
 * @param challengeId The ID of the challenge
 * @returns The rating object or null if not found
 */
export const getUserChallengeRating = async (
  userId: string,
  challengeId: string
): Promise<Rating | null> => {
  try {
    const ratingRef = doc(db, 'challenge_ratings', `${userId}_${challengeId}`);
    const ratingDoc = await getDoc(ratingRef);
    
    if (ratingDoc.exists()) {
      return ratingDoc.data() as Rating;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return null;
  }
};

/**
 * Gets all ratings for a challenge
 * @param challengeId The ID of the challenge
 * @returns An array of rating objects
 */
export const getChallengeRatings = async (
  challengeId: string
): Promise<Rating[]> => {
  try {
    const ratingsQuery = query(
      collection(db, 'challenge_ratings'),
      where('challengeId', '==', challengeId)
    );
    
    const ratingsSnapshot = await getDocs(ratingsQuery);
    const ratings: Rating[] = [];
    
    ratingsSnapshot.forEach(doc => {
      ratings.push(doc.data() as Rating);
    });
    
    return ratings;
  } catch (error) {
    console.error('Error fetching challenge ratings:', error);
    return [];
  }
}; 