// src/lib/ensureDefaultBlocks.ts
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// Default blocks definition based on the concept document
const DEFAULT_BLOCKS = [
  { name: '朝ブロック', startTime: '08:00', endTime: '09:30', order: 0 },
  { name: '午前ブロック', startTime: '09:30', endTime: '12:00', order: 1 },
  { name: '昼ブロック', startTime: '13:00', endTime: '14:00', order: 2 },
  { name: '午後ブロック', startTime: '14:00', endTime: '17:00', order: 3 },
  { name: '夜ブロック', startTime: '19:00', endTime: '21:00', order: 4 },
];

/**
 * Ensures the user has the default time blocks created in their account
 * This runs on initial app load to set up the standard time blocks
 */
export const ensureDefaultBlocks = async (userId: string): Promise<void> => {
  try {
    // Check if user already has blocks
    const blocksRef = collection(db, 'blocks');
    const q = query(blocksRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    // If no blocks exist, create default ones
    if (snapshot.empty) {
      console.log('Creating default blocks for user', userId);

      // Create all blocks in parallel using Promise.all
      await Promise.all(
        DEFAULT_BLOCKS.map((block) =>
          addDoc(blocksRef, {
            userId,
            name: block.name,
            startTime: block.startTime,
            endTime: block.endTime,
            order: block.order,
          })
        )
      );

      console.log('Default blocks created successfully');
    }
  } catch (error) {
    console.error('Error ensuring default blocks:', error);
    throw error;
  }
};
