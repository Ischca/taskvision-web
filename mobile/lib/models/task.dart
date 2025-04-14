import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';

enum TaskPriority {
  high,
  medium,
  low,
}

enum TaskStatus {
  notStarted,
  inProgress,
  completed,
}

class Task {
  final String id;
  final String title;
  final String? description;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? dueDate;
  final TaskPriority priority;
  final TaskStatus status;
  final String userId;
  final String? blockId;
  final List<String>? tags;
  final bool isDeleted;
  final String? parentTaskId;
  final Map<String, dynamic>? repeatConfig;

  Task({
    String? id,
    required this.title,
    this.description,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.dueDate,
    this.priority = TaskPriority.medium,
    this.status = TaskStatus.notStarted,
    required this.userId,
    this.blockId,
    this.tags,
    this.isDeleted = false,
    this.parentTaskId,
    this.repeatConfig,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Task copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? dueDate,
    TaskPriority? priority,
    TaskStatus? status,
    String? userId,
    String? blockId,
    List<String>? tags,
    bool? isDeleted,
    String? parentTaskId,
    Map<String, dynamic>? repeatConfig,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      dueDate: dueDate ?? this.dueDate,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      userId: userId ?? this.userId,
      blockId: blockId ?? this.blockId,
      tags: tags ?? this.tags,
      isDeleted: isDeleted ?? this.isDeleted,
      parentTaskId: parentTaskId ?? this.parentTaskId,
      repeatConfig: repeatConfig ?? this.repeatConfig,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'dueDate': dueDate != null ? Timestamp.fromDate(dueDate!) : null,
      'priority': priority.index,
      'status': status.index,
      'userId': userId,
      'blockId': blockId,
      'tags': tags,
      'isDeleted': isDeleted,
      'parentTaskId': parentTaskId,
      'repeatConfig': repeatConfig,
    };
  }

  factory Task.fromMap(Map<String, dynamic> map) {
    return Task(
      id: map['id'],
      title: map['title'],
      description: map['description'],
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      updatedAt: (map['updatedAt'] as Timestamp).toDate(),
      dueDate: map['dueDate'] != null
          ? (map['dueDate'] as Timestamp).toDate()
          : null,
      priority: TaskPriority.values[map['priority']],
      status: TaskStatus.values[map['status']],
      userId: map['userId'],
      blockId: map['blockId'],
      tags: map['tags'] != null ? List<String>.from(map['tags']) : null,
      isDeleted: map['isDeleted'] ?? false,
      parentTaskId: map['parentTaskId'],
      repeatConfig: map['repeatConfig'],
    );
  }

  factory Task.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Task.fromMap(data);
  }

  // Helper methods for task filtering
  bool isOverdue() {
    if (dueDate == null) return false;
    return dueDate!.isBefore(DateTime.now()) && status != TaskStatus.completed;
  }

  bool isDueToday() {
    if (dueDate == null) return false;
    final now = DateTime.now();
    return dueDate!.year == now.year &&
        dueDate!.month == now.month &&
        dueDate!.day == now.day;
  }

  bool isDueThisWeek() {
    if (dueDate == null) return false;
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final endOfWeek = startOfWeek.add(const Duration(days: 6));
    return dueDate!.isAfter(startOfWeek.subtract(const Duration(days: 1))) &&
        dueDate!.isBefore(endOfWeek.add(const Duration(days: 1)));
  }

  bool hasTag(String tag) {
    return tags != null && tags!.contains(tag);
  }

  bool get isCompleted => status == TaskStatus.completed;
}
