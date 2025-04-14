import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/task.dart';

class TaskService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'tasks';

  // Get all tasks for a user
  Stream<List<Task>> getTasks(String userId) {
    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Task.fromFirestore(doc)).toList();
        });
  }

  // Get a single task by ID
  Stream<Task?> getTask(String taskId) {
    return _firestore
        .collection(_collection)
        .doc(taskId)
        .snapshots()
        .map((doc) {
          if (doc.exists) {
            return Task.fromFirestore(doc);
          }
          return null;
        });
  }

  // Add a new task
  Future<String> addTask(Task task) async {
    final docRef = await _firestore.collection(_collection).add(task.toMap());
    return docRef.id;
  }

  // Update an existing task
  Future<void> updateTask(Task task) async {
    await _firestore.collection(_collection).doc(task.id).update(task.toMap());
  }

  // Delete a task (soft delete)
  Future<void> deleteTask(String taskId) async {
    await _firestore
        .collection(_collection)
        .doc(taskId)
        .update({'isDeleted': true});
  }

  // Permanently delete a task
  Future<void> permanentlyDeleteTask(String taskId) async {
    await _firestore.collection(_collection).doc(taskId).delete();
  }

  // Get tasks by status
  Stream<List<Task>> getTasksByStatus(String userId, TaskStatus status) {
    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('status', isEqualTo: status.index)
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Task.fromFirestore(doc)).toList();
        });
  }

  // Get tasks by priority
  Stream<List<Task>> getTasksByPriority(String userId, TaskPriority priority) {
    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('priority', isEqualTo: priority.index)
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Task.fromFirestore(doc)).toList();
        });
  }

  // Get tasks by due date (today)
  Stream<List<Task>> getTasksDueToday(String userId) {
    final today = DateTime.now();
    final startOfDay = DateTime(today.year, today.month, today.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('dueDate', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('dueDate', isLessThan: Timestamp.fromDate(endOfDay))
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Task.fromFirestore(doc)).toList();
        });
  }

  // Get overdue tasks
  Stream<List<Task>> getOverdueTasks(String userId) {
    final today = DateTime.now();
    final startOfDay = DateTime(today.year, today.month, today.day);

    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('dueDate', isLessThan: Timestamp.fromDate(startOfDay))
        .where('status', isNotEqualTo: TaskStatus.completed.index)
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Task.fromFirestore(doc)).toList();
        });
  }

  // Get tasks by tag
  Stream<List<Task>> getTasksByTag(String userId, String tag) {
    return _firestore
        .collection(_collection)
        .where('userId', isEqualTo: userId)
        .where('tags', arrayContains: tag)
        .where('isDeleted', isEqualTo: false)
        .snapshots()
        .map((snapshot) {
          return snapshot.docs.map((doc) => Task.fromFirestore(doc)).toList();
        });
  }
}
