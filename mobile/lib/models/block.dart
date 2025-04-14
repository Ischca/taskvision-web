import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';

class Block {
  final String id;
  final String name;
  final DateTime? startTime;
  final DateTime? endTime;
  final int order;
  final String userId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? color;

  Block({
    String? id,
    required this.name,
    this.startTime,
    this.endTime,
    required this.order,
    required this.userId,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.color,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Block copyWith({
    String? id,
    String? name,
    DateTime? startTime,
    DateTime? endTime,
    int? order,
    String? userId,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? color,
  }) {
    return Block(
      id: id ?? this.id,
      name: name ?? this.name,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      order: order ?? this.order,
      userId: userId ?? this.userId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      color: color ?? this.color,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'startTime': startTime?.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'order': order,
      'userId': userId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'color': color,
    };
  }

  factory Block.fromMap(Map<String, dynamic> map) {
    return Block(
      id: map['id'],
      name: map['name'],
      startTime: map['startTime'] != null
          ? DateTime.parse(map['startTime'])
          : null,
      endTime: map['endTime'] != null
          ? DateTime.parse(map['endTime'])
          : null,
      order: map['order'],
      userId: map['userId'],
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      color: map['color'],
    );
  }

  factory Block.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Block(
      id: doc.id,
      name: data['name'] ?? '',
      startTime: data['startTime'] != null
          ? (data['startTime'] as Timestamp).toDate()
          : null,
      endTime: data['endTime'] != null
          ? (data['endTime'] as Timestamp).toDate()
          : null,
      order: data['order'] ?? 0,
      userId: data['userId'] ?? '',
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      updatedAt: (data['updatedAt'] as Timestamp).toDate(),
      color: data['color'],
    );
  }
}
