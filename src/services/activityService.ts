import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Activity types
export type ActivityType = 'created' | 'updated' | 'deleted' | 'started' | 'completed';

export interface Activity {
  id?: string;
  type: ActivityType;
  userId: string;
  challengeId: string;
  timestamp: Timestamp;
  details?: Record<string, any>;
}

/**
 * Creates an activity record for a user's interaction with a challenge
 * @param userId The ID of the user performing the action
 * @param challengeId The ID of the challenge being acted upon
 * @param type The type of activity
 * @param details Optional details about the activity
 * @returns The ID of the created activity document
 */
export const createActivity = async (
  userId: string,
  challengeId: string,
  type: ActivityType,
  details?: Record<string, any>
): Promise<string> => {
  try {
    const activityData: Omit<Activity, 'id'> = {
      userId,
      challengeId,
      type,
      timestamp: Timestamp.now(),
      details
    };
    
    const docRef = await addDoc(collection(db, 'activities'), activityData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw new Error('Failed to record activity');
  }
}; 