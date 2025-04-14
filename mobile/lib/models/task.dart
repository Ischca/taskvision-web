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
  final DateTime? dueDate;
  final TaskPriority priority;
  final TaskStatus status;
  final String userId;
  final List<String>? tags;
  final bool isDeleted;

  Task({
    String? id,
    required this.title,
    this.description,
    DateTime? createdAt,
    this.dueDate,
    this.priority = TaskPriority.medium,
    this.status = TaskStatus.notStarted,
    required this.userId,
    this.tags,
    this.isDeleted = false,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  Task copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? createdAt,
    DateTime? dueDate,
    TaskPriority? priority,
    TaskStatus? status,
    String? userId,
    List<String>? tags,
    bool? isDeleted,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      dueDate: dueDate ?? this.dueDate,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      userId: userId ?? this.userId,
      tags: tags ?? this.tags,
      isDeleted: isDeleted ?? this.isDeleted,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'createdAt': Timestamp.fromDate(createdAt),
      'dueDate': dueDate != null ? Timestamp.fromDate(dueDate!) : null,
      'priority': priority.index,
      'status': status.index,
      'userId': userId,
      'tags': tags,
      'isDeleted': isDeleted,
    };
  }

  factory Task.fromMap(Map<String, dynamic> map) {
    return Task(
      id: map['id'],
      title: map['title'],
      description: map['description'],
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      dueDate: map['dueDate'] != null
          ? (map['dueDate'] as Timestamp).toDate()
          : null,
      priority: TaskPriority.values[map['priority']],
      status: TaskStatus.values[map['status']],
      userId: map['userId'],
      tags: map['tags'] != null ? List<String>.from(map['tags']) : null,
      isDeleted: map['isDeleted'] ?? false,
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
}
