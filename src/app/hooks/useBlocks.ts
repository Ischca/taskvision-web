import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Block } from '@/types';
import { useAuth } from '../components/AuthProvider';

export function useBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const blocksRef = collection(db, 'blocks');
    const q = query(
      blocksRef,
      where('userId', '==', userId),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const blockData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Block[];

        setBlocks(blockData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching blocks:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { blocks, loading };
}
