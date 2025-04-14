import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';

class Task {
  final String id;
  final String title;
  final String? description;
  final bool completed;
  final DateTime? deadline;
  final String userId;
  final String? blockId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? parentTaskId;
  final Map<String, dynamic>? repeatConfig;

  Task({
    String? id,
    required this.title,
    this.description,
    this.completed = false,
    this.deadline,
    required this.userId,
    this.blockId,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.parentTaskId,
    this.repeatConfig,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Task copyWith({
    String? id,
    String? title,
    String? description,
    bool? completed,
    DateTime? deadline,
    String? userId,
    String? blockId,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? parentTaskId,
    Map<String, dynamic>? repeatConfig,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      completed: completed ?? this.completed,
      deadline: deadline ?? this.deadline,
      userId: userId ?? this.userId,
      blockId: blockId ?? this.blockId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      parentTaskId: parentTaskId ?? this.parentTaskId,
      repeatConfig: repeatConfig ?? this.repeatConfig,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'completed': completed,
      'deadline': deadline?.toIso8601String(),
      'userId': userId,
      'blockId': blockId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'parentTaskId': parentTaskId,
      'repeatConfig': repeatConfig,
    };
  }

  factory Task.fromMap(Map<String, dynamic> map) {
    return Task(
      id: map['id'],
      title: map['title'],
      description: map['description'],
      completed: map['completed'] ?? false,
      deadline: map['deadline'] != null
          ? DateTime.parse(map['deadline'])
          : null,
      userId: map['userId'],
      blockId: map['blockId'],
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      parentTaskId: map['parentTaskId'],
      repeatConfig: map['repeatConfig'],
    );
  }

  factory Task.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Task(
      id: doc.id,
      title: data['title'] ?? '',
      description: data['description'],
      completed: data['completed'] ?? false,
      deadline: data['deadline'] != null
          ? (data['deadline'] as Timestamp).toDate()
          : null,
      userId: data['userId'] ?? '',
      blockId: data['blockId'],
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
      parentTaskId: data['parentTaskId'],
      repeatConfig: data['repeatConfig'],
    );
  }
}
