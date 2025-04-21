import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/block.dart';

class BlockService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'blocks';

  // Get all blocks for a user
  Stream<List<Block>> getBlocks(String userId) {
    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Block.fromFirestore(doc)).toList();
        });
  }

  // Get a single block by ID
  Stream<Block?> getBlock(String blockId) {
    return _firestore
        .collection(_collection)
        .doc(blockId)
        .snapshots()
        .map((doc) {
          if (doc.exists) {
            return Block.fromFirestore(doc);
          }
          return null;
        });
  }

  // Add a new block
  Future<String> addBlock(Block block) async {
    final docRef = await _firestore.collection(_collection).add(block.toMap());
    return docRef.id;
  }

  // Update an existing block
  Future<void> updateBlock(Block block) async {
    await _firestore.collection(_collection).doc(block.id).update(block.toMap());
  }

  // Delete a block (soft delete)
  Future<void> deleteBlock(String blockId) async {
    await _firestore
        .collection(_collection)
        .doc(blockId)
        .update({'isDeleted': true});
  }

  // Permanently delete a block
  Future<void> permanentlyDeleteBlock(String blockId) async {
    await _firestore.collection(_collection).doc(blockId).delete();
  }

  // Get blocks for a specific day
  Stream<List<Block>> getBlocksForDay(String userId, DateTime day) {
    final startOfDay = DateTime(day.year, day.month, day.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('startTime', isLessThan: Timestamp.fromDate(endOfDay))
        .where('endTime', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Block.fromFirestore(doc)).toList();
        });
  }

  // Get blocks for a specific week
  Stream<List<Block>> getBlocksForWeek(String userId, DateTime weekStart) {
    final startOfWeek = DateTime(weekStart.year, weekStart.month, weekStart.day);
    final endOfWeek = startOfWeek.add(const Duration(days: 7));

    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('startTime', isLessThan: Timestamp.fromDate(endOfWeek))
        .where('endTime', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfWeek))
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Block.fromFirestore(doc)).toList();
        });
  }

  // Get blocks for a specific month
  Stream<List<Block>> getBlocksForMonth(String userId, DateTime monthStart) {
    final startOfMonth = DateTime(monthStart.year, monthStart.month, 1);
    final endOfMonth = (monthStart.month < 12)
        ? DateTime(monthStart.year, monthStart.month + 1, 1)
        : DateTime(monthStart.year + 1, 1, 1);

    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('startTime', isLessThan: Timestamp.fromDate(endOfMonth))
        .where('endTime', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfMonth))
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Block.fromFirestore(doc)).toList();
        });
  }

  // Get blocks related to a specific task
  Stream<List<Block>> getBlocksForTask(String userId, String taskId) {
    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('taskId', isEqualTo: taskId)
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Block.fromFirestore(doc)).toList();
        });
  }

  // Check for overlapping blocks
  Future<bool> hasOverlappingBlocks(String userId, Block block) async {
    final querySnapshot = await _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('startTime', isLessThan: Timestamp.fromDate(block.endTime))
        .where('endTime', isGreaterThan: Timestamp.fromDate(block.startTime))
        .where('isDeleted', isEqualTo: false)
        .get();

    // Filter out the current block if it's an update
    final overlappingBlocks = querySnapshot.docs
        .map((doc) => Block.fromFirestore(doc))
        .where((existingBlock) => existingBlock.id != block.id)
        .toList();

    return overlappingBlocks.isNotEmpty;
  }
}
